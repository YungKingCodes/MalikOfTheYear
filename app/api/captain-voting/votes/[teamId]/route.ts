import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/auth'

export async function GET(request: Request, { params }: { params: { teamId: string } }) {
  try {
    // Authenticate user - only admins can view all votes
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized: Only admins can view all captain votes" },
        { status: 401 }
      )
    }

    const teamId = params.teamId
    
    if (!teamId) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 }
      )
    }

    // Get the team to ensure it exists
    const team = await db.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    if (!team) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      )
    }

    // Get all votes for this team
    const votes = await db.captainVote.findMany({
      where: {
        teamId: teamId
      }
    })

    // Count votes for each captain
    const voteCounts: Record<string, number> = {}
    votes.forEach(vote => {
      voteCounts[vote.captainId] = (voteCounts[vote.captainId] || 0) + 1
    })

    // Format the response with player details
    const formattedVotes = team.members.map(member => {
      return {
        playerId: member.id,
        playerName: member.name || 'Unknown',
        playerImage: member.image,
        voteCount: voteCounts[member.id] || 0
      }
    }).sort((a, b) => b.voteCount - a.voteCount) // Sort by vote count (highest first)

    // Calculate voting progress
    const totalMembers = team.members.length
    const votesSubmitted = new Set(votes.map(v => v.voterId)).size
    const votingPercentage = totalMembers > 0 ? Math.round((votesSubmitted / totalMembers) * 100) : 0

    return NextResponse.json({
      votes: formattedVotes,
      totalVotes: votes.length,
      totalMembers: totalMembers,
      votesSubmitted: votesSubmitted,
      votingPercentage: votingPercentage,
      teamName: team.name
    })
  } catch (error) {
    console.error("Error fetching captain votes:", error)
    return NextResponse.json(
      { error: "Failed to fetch captain votes" },
      { status: 500 }
    )
  }
} 