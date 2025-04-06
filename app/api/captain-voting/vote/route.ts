import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/auth'

export async function POST(request: Request) {
  try {
    // Authenticate user
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { phaseId, captainId, teamId } = body

    if (!phaseId || !captainId || !teamId) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    // Verify the user and captain belong to the same team
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

    // Check if user is in the team
    const userInTeam = team.members.some(member => member.id === session.user.id)
    if (!userInTeam) {
      return NextResponse.json(
        { error: "You are not a member of this team" },
        { status: 403 }
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

    // Check if user has already voted
    const existingVote = await db.captainVote.findFirst({
      where: {
        voterId: session.user.id,
        phaseId: phase.id,
        teamId: teamId
      }
    })

    // Update or create captain vote
    if (existingVote) {
      await db.captainVote.update({
        where: { id: existingVote.id },
        data: {
          captainId: captainId,
          updatedAt: new Date()
        }
      })
    } else {
      await db.captainVote.create({
        data: {
          voterId: session.user.id,
          captainId: captainId,
          teamId: teamId,
          phaseId: phase.id,
          competitionId: phase.competitionId
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving captain vote:", error)
    return NextResponse.json(
      { error: "Failed to save captain vote" },
      { status: 500 }
    )
  }
} 