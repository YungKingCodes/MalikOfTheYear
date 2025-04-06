import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/auth'

export async function GET(request: Request, { params }: { params: { competitionId: string } }) {
  try {
    // Authenticate user
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const competitionId = params.competitionId
    
    if (!competitionId) {
      return NextResponse.json(
        { error: "Competition ID is required" },
        { status: 400 }
      )
    }

    // First, get all users registered for this competition
    const registrations = await db.userCompetition.findMany({
      where: {
        competitionId: competitionId,
        status: "approved"
      },
      select: {
        userId: true
      }
    })

    const userIds = registrations.map(reg => reg.userId)
    
    // Then, get detailed user information
    const players = await db.user.findMany({
      where: {
        id: { in: userIds }
      },
      select: {
        id: true,
        name: true,
        image: true,
        proficiencyScore: true,
        position: true,
        teamId: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    // For each player, calculate their average score from self-assessment and peer ratings
    const playersWithScores = await Promise.all(
      players.map(async (player) => {
        // Get self-assessment for the player
        const selfScores = await db.playerSelfScore.findMany({
          where: {
            userId: player.id,
            competitionId: competitionId
          }
        })
        
        // Get peer ratings for the player
        const peerRatings = await db.playerRating.findMany({
          where: {
            ratedId: player.id,
            competitionId: competitionId
          }
        })
        
        // Calculate average score from self-assessment
        let selfScoreAvg = 0
        if (selfScores.length > 0) {
          const selfScoreSum = selfScores.reduce((sum, score) => {
            const scoreValues = Object.values(score.scores as Record<string, number>)
            return sum + scoreValues.reduce((s, v) => s + v, 0) / scoreValues.length
          }, 0)
          selfScoreAvg = selfScoreSum / selfScores.length
        }
        
        // Calculate average score from peer ratings
        let peerScoreAvg = 0
        if (peerRatings.length > 0) {
          const peerScoreSum = peerRatings.reduce((sum, rating) => {
            const scoreValues = Object.values(rating.scores as Record<string, number>)
            return sum + scoreValues.reduce((s, v) => s + v, 0) / scoreValues.length
          }, 0)
          peerScoreAvg = peerScoreSum / peerRatings.length
        }
        
        // Overall score is average of self and peer scores, defaulting to existing proficiency score if no ratings
        let overallScore = player.proficiencyScore || 0
        
        // If we have ratings, update the overall score
        if (selfScores.length > 0 || peerRatings.length > 0) {
          // Weight self-assessment at 30% and peer ratings at 70%
          if (selfScores.length > 0 && peerRatings.length > 0) {
            overallScore = Math.round(selfScoreAvg * 0.3 + peerScoreAvg * 0.7)
          }
          // Only self-assessment available
          else if (selfScores.length > 0) {
            overallScore = Math.round(selfScoreAvg)
          }
          // Only peer ratings available
          else if (peerRatings.length > 0) {
            overallScore = Math.round(peerScoreAvg)
          }
          
          // Convert from 1-5 scale to 0-100 scale
          if (selfScores.length > 0 || peerRatings.length > 0) {
            overallScore = Math.round((overallScore / 5) * 100)
          }
        }
        
        return {
          ...player,
          proficiencyScore: overallScore
        }
      })
    )

    return NextResponse.json({ players: playersWithScores })
  } catch (error) {
    console.error("Error fetching registered players:", error)
    return NextResponse.json(
      { error: "Failed to fetch registered players" },
      { status: 500 }
    )
  }
} 