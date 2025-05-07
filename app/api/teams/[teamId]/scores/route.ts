import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/auth'

export async function GET(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    if (!params.teamId) {
      return new Response("Team ID is required", { status: 400 })
    }

    const teamId = params.teamId
    
    // Get competition ID from query params
    const { searchParams } = new URL(request.url)
    const competitionId = searchParams.get('competitionId')
    
    if (!competitionId) {
      return NextResponse.json(
        { error: "Competition ID is required" },
        { status: 400 }
      )
    }

    // Authenticate user
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Only admins and captains can view team scores
    if (session.user.role !== 'admin' && session.user.role !== 'captain') {
      return NextResponse.json(
        { error: "Unauthorized: Only admins and team captains can view team scores" },
        { status: 403 }
      )
    }

    // Get team to verify it exists and check authorization
    const team = await db.team.findUnique({
      where: { id: teamId },
      include: {
        members: true
      }
    })

    if (!team) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      )
    }

    // If user is a captain, they should only see their own team's scores
    if (session.user.role === 'captain' && team.captainId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized: Captains can only view their own team's scores" },
        { status: 403 }
      )
    }

    // Get all members of the team
    const memberIds = team.members.map(member => member.id)
    
    // Get self-assessment scores for all team members
    const selfScores = await db.playerSelfScore.findMany({
      where: {
        userId: { in: memberIds },
        competitionId: competitionId
      }
    })
    
    // Get peer ratings for all team members
    const peerRatings = await db.playerRating.findMany({
      where: {
        ratedId: { in: memberIds },
        competitionId: competitionId
      }
    })
    
    // Calculate final scores for each team member
    const memberScores = team.members.map(member => {
      // Get self-assessment scores for this member
      const memberSelfScores = selfScores.filter(score => score.userId === member.id)
      
      // Calculate average self score
      let selfScoreAvg = 0
      if (memberSelfScores.length > 0) {
        const selfScoreSum = memberSelfScores.reduce((sum, score) => {
          const scoreValues = Object.values(score.scores as Record<string, number>)
          return sum + scoreValues.reduce((s, v) => s + v, 0) / scoreValues.length
        }, 0)
        selfScoreAvg = selfScoreSum / memberSelfScores.length
      }
      
      // Get peer ratings for this member
      const memberPeerRatings = peerRatings.filter(rating => rating.ratedId === member.id)
      
      // Calculate average peer score
      let peerScoreAvg = 0
      if (memberPeerRatings.length > 0) {
        const peerScoreSum = memberPeerRatings.reduce((sum, rating) => {
          const scoreValues = Object.values(rating.scores as Record<string, number>)
          return sum + scoreValues.reduce((s, v) => s + v, 0) / scoreValues.length
        }, 0)
        peerScoreAvg = peerScoreSum / memberPeerRatings.length
      }
      
      // Calculate final score - weight self-assessment at 40% and peer ratings at 60%
      let finalScore = 0
      
      if (memberSelfScores.length > 0 || memberPeerRatings.length > 0) {
        if (memberSelfScores.length > 0 && memberPeerRatings.length > 0) {
          finalScore = Math.round(selfScoreAvg * 0.4 + peerScoreAvg * 0.6)
        } else if (memberSelfScores.length > 0) {
          finalScore = Math.round(selfScoreAvg)
        } else if (memberPeerRatings.length > 0) {
          finalScore = Math.round(peerScoreAvg)
        }
        
        // Convert from 1-5 scale to 0-100 scale
        finalScore = Math.round((finalScore / 5) * 100)
      }
      
      return {
        id: member.id,
        name: member.name,
        email: member.email,
        image: member.image,
        selfScore: memberSelfScores.length > 0 ? selfScoreAvg : null,
        peerScore: memberPeerRatings.length > 0 ? peerScoreAvg : null,
        finalScore,
        isCaptain: member.id === team.captainId
      }
    })
    
    return NextResponse.json({
      teamId: team.id,
      teamName: team.name,
      competitionId,
      members: memberScores,
      totalMembers: memberScores.length,
      averageScore: memberScores.length > 0 
        ? Math.round(memberScores.reduce((sum, m) => sum + m.finalScore, 0) / memberScores.length) 
        : 0
    })
  } catch (error) {
    console.error("Error fetching team scores:", error)
    return NextResponse.json(
      { error: "Failed to fetch team scores" },
      { status: 500 }
    )
  }
} 