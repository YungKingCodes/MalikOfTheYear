import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/auth'

export async function POST(request: Request) {
  try {
    // Authenticate user - only admins can conclude voting
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized: Only admins can conclude captain voting" },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { phaseId, teamId, selectedCaptainId } = body

    // If teamId and selectedCaptainId are provided, handle single team captain assignment
    if (teamId && selectedCaptainId) {
      return await handleSingleTeamCaptainAssignment(teamId, selectedCaptainId)
    }
    
    // Otherwise, proceed with bulk assignment for the entire phase
    if (!phaseId) {
      return NextResponse.json(
        { error: "Missing required phaseId" },
        { status: 400 }
      )
    }

    // Verify the phase exists and is of type captain_voting
    const phase = await db.competitionPhase.findUnique({
      where: { id: phaseId },
      select: { 
        id: true, 
        type: true,
        status: true,
        competitionId: true 
      }
    })

    if (!phase) {
      return NextResponse.json(
        { error: "Phase not found" },
        { status: 404 }
      )
    }

    if (phase.type !== "captain_voting") {
      return NextResponse.json(
        { error: "This phase does not support captain voting" },
        { status: 400 }
      )
    }

    if (phase.status !== "in-progress") {
      return NextResponse.json(
        { error: "This phase is not currently active" },
        { status: 400 }
      )
    }

    // Get all teams that participated in voting
    const teamsWithVotes = await db.captainVote.groupBy({
      by: ['teamId'],
      where: {
        phaseId: phase.id
      }
    })

    // Process each team
    const results = await Promise.all(
      teamsWithVotes.map(async ({ teamId }) => {
        // Get all votes for this team
        const votes = await db.captainVote.findMany({
          where: {
            teamId,
            phaseId: phase.id
          }
        })

        if (votes.length === 0) return { teamId, success: false, message: "No votes found" }

        // Count votes for each captain
        const voteCounts = votes.reduce((acc, vote) => {
          acc[vote.captainId] = (acc[vote.captainId] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        // Find the captain with the most votes
        let winningCaptainId: string | null = null
        let maxVotes = 0

        Object.entries(voteCounts).forEach(([captainId, count]) => {
          if (count > maxVotes) {
            maxVotes = count
            winningCaptainId = captainId
          }
        })

        if (!winningCaptainId) {
          return { teamId, success: false, message: "Could not determine a winning captain" }
        }

        // Update the team with the new captain
        await db.team.update({
          where: { id: teamId },
          data: { captainId: winningCaptainId }
        })

        // Update the user's role to captain
        await db.user.update({
          where: { id: winningCaptainId },
          data: { role: 'captain' }
        })

        return { 
          teamId, 
          success: true, 
          captainId: winningCaptainId,
          voteCounts 
        }
      })
    )

    // Mark the phase as completed
    await db.competitionPhase.update({
      where: { id: phase.id },
      data: { status: 'completed' }
    })

    return NextResponse.json({ 
      success: true, 
      results 
    })
  } catch (error) {
    console.error("Error concluding captain voting:", error)
    return NextResponse.json(
      { error: "Failed to conclude captain voting" },
      { status: 500 }
    )
  }
}

// Helper function to handle single team captain assignment
async function handleSingleTeamCaptainAssignment(teamId: string, captainId: string) {
  try {
    // Verify the team exists
    const team = await db.team.findUnique({
      where: { id: teamId },
      include: { members: true }
    })

    if (!team) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      )
    }

    // Check if captain is in the team
    const captainInTeam = team.members.some(member => member.id === captainId)
    if (!captainInTeam) {
      return NextResponse.json(
        { error: "The selected captain is not a member of this team" },
        { status: 400 }
      )
    }

    // Update the team with the new captain
    await db.team.update({
      where: { id: teamId },
      data: { captainId }
    })

    // Update the user's role to captain
    await db.user.update({
      where: { id: captainId },
      data: { role: 'captain' }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Captain has been assigned successfully",
      teamId,
      captainId
    })
  } catch (error) {
    console.error("Error assigning team captain:", error)
    return NextResponse.json(
      { error: "Failed to assign team captain" },
      { status: 500 }
    )
  }
}

// API endpoint to manually set a team captain (admin only)
export async function PUT(request: Request) {
  try {
    // Authenticate user - only admins can manually set captains
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized: Only admins can manually set captains" },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { teamId, captainId } = body

    if (!teamId || !captainId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify the team exists
    const team = await db.team.findUnique({
      where: { id: teamId },
      include: { members: true }
    })

    if (!team) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      )
    }

    // Check if captain is in the team
    const captainInTeam = team.members.some(member => member.id === captainId)
    if (!captainInTeam) {
      return NextResponse.json(
        { error: "The selected captain is not a member of this team" },
        { status: 400 }
      )
    }

    // Update the team with the new captain
    await db.team.update({
      where: { id: teamId },
      data: { captainId }
    })

    // Update the user's role to captain
    await db.user.update({
      where: { id: captainId },
      data: { role: 'captain' }
    })

    return NextResponse.json({ 
      success: true,
      teamId,
      captainId
    })
  } catch (error) {
    console.error("Error manually setting team captain:", error)
    return NextResponse.json(
      { error: "Failed to set team captain" },
      { status: 500 }
    )
  }
} 