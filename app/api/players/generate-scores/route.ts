import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function POST(request: Request) {
  try {
    // Authenticate user
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Only admins can generate scores
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized: Only admins can generate player scores" },
        { status: 403 }
      )
    }
    
    // Get request data
    const data = await request.json()
    
    if (!data?.competitionId) {
      return NextResponse.json(
        { error: "Competition ID is required" },
        { status: 400 }
      )
    }
    
    const { competitionId } = data
    
    // Verify competition exists
    const competition = await db.competition.findUnique({
      where: { id: competitionId }
    })
    
    if (!competition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 }
      )
    }
    
    // Get all registered players for the competition
    const registeredPlayers = await db.userCompetition.findMany({
      where: {
        competitionId,
        status: 'registered'
      },
      select: {
        id: true,
        userId: true
      }
    })
    
    if (registeredPlayers.length === 0) {
      return NextResponse.json(
        { error: "No registered players found for this competition" },
        { status: 400 }
      )
    }
    
    // Get all self-scores for this competition
    const selfScores = await db.playerSelfScore.findMany({
      where: { competitionId }
    })
    
    // Get peer ratings for this competition
    const peerRatings = await db.playerRating.findMany({
      where: { competitionId }
    })
    
    // Map players to their scores
    const playerScores: Record<string, {
      selfScores: number[], // Array to hold all self scores across categories
      peerScores: number[]  // Array to hold all peer rating scores across categories
    }> = {}
    
    // Initialize player scores
    registeredPlayers.forEach(player => {
      playerScores[player.userId] = {
        selfScores: [],
        peerScores: []
      }
    })
    
    // Helper function to validate score is within 1-5 range
    const isValidScore = (score: any): boolean => {
      const numScore = Number(score)
      return !isNaN(numScore) && numScore >= 1 && numScore <= 5
    }
    
    // Process self-scores
    selfScores.forEach(scoreRecord => {
      if (!playerScores[scoreRecord.userId]) return
      
      // Extract score values from the scores property
      if (scoreRecord.scores) {
        let validScores: number[] = []
        
        // Handle scores as an array of category scores
        if (Array.isArray(scoreRecord.scores)) {
          // Filter for valid 1-5 scores
          validScores = scoreRecord.scores
            .filter(score => isValidScore(score))
            .map(score => Number(score))
        } 
        // Handle scores as an object with category properties
        else if (typeof scoreRecord.scores === 'object') {
          // If it's an object with an 'overall' property, prioritize that
          if ('overall' in scoreRecord.scores && isValidScore(scoreRecord.scores.overall)) {
            validScores.push(Number(scoreRecord.scores.overall))
          } else {
            // Extract all numeric values from the object that are in the 1-5 range
            validScores = Object.values(scoreRecord.scores)
              .filter(score => isValidScore(score))
              .map(score => Number(score))
          }
        }
        
        // Add all valid scores to the player's self scores
        if (validScores.length > 0) {
          playerScores[scoreRecord.userId].selfScores.push(...validScores)
        }
      }
    })
    
    // Process peer ratings
    peerRatings.forEach(ratingRecord => {
      if (!playerScores[ratingRecord.ratedId]) return
      
      // Extract rating values from the scores property
      if (ratingRecord.scores) {
        let validScores: number[] = []
        
        // Handle scores as an array of category scores
        if (Array.isArray(ratingRecord.scores)) {
          // Filter for valid 1-5 scores
          validScores = ratingRecord.scores
            .filter(score => isValidScore(score))
            .map(score => Number(score))
        } 
        // Handle scores as an object with category properties
        else if (typeof ratingRecord.scores === 'object') {
          // If it's an object with an 'overall' property, prioritize that
          if ('overall' in ratingRecord.scores && isValidScore(ratingRecord.scores.overall)) {
            validScores.push(Number(ratingRecord.scores.overall))
          } else {
            // Extract all numeric values from the object that are in the 1-5 range
            validScores = Object.values(ratingRecord.scores)
              .filter(score => isValidScore(score))
              .map(score => Number(score))
          }
        }
        
        // Add all valid scores to the player's peer scores
        if (validScores.length > 0) {
          playerScores[ratingRecord.ratedId].peerScores.push(...validScores)
        }
      }
    })
    
    // Calculate final proficiency scores and update players
    const updates = []
    
    for (const [userId, scores] of Object.entries(playerScores)) {
      // Calculate average scores if available, otherwise use default mid-point (3 on 1-5 scale)
      const selfScoreAvg = scores.selfScores.length > 0 
        ? scores.selfScores.reduce((sum, score) => sum + score, 0) / scores.selfScores.length 
        : 3 // Default if no self-scores (middle of 1-5 scale)
      
      const peerScoreAvg = scores.peerScores.length > 0 
        ? scores.peerScores.reduce((sum, score) => sum + score, 0) / scores.peerScores.length 
        : 3 // Default if no peer scores (middle of 1-5 scale)
      
      // Log for debugging
      console.log(`Player ${userId} - Self scores: ${scores.selfScores.length > 0 ? scores.selfScores.join(', ') : 'none'}, avg: ${selfScoreAvg.toFixed(2)}`)
      console.log(`Player ${userId} - Peer scores: ${scores.peerScores.length > 0 ? scores.peerScores.join(', ') : 'none'}, avg: ${peerScoreAvg.toFixed(2)}`)
      
      // Calculate final proficiency score with 40% self-score and 60% peer ratings
      let weightedAvg
      
      if (scores.selfScores.length > 0 && scores.peerScores.length > 0) {
        // Both self-score and peer ratings available - use requested weights
        weightedAvg = (selfScoreAvg * 0.4) + (peerScoreAvg * 0.6)
      } else if (scores.selfScores.length > 0) {
        // Only self-score available - weight more heavily but still mix with mid-point
        weightedAvg = (selfScoreAvg * 0.7) + (3 * 0.3)
      } else if (scores.peerScores.length > 0) {
        // Only peer ratings available - weight more heavily
        weightedAvg = (peerScoreAvg * 0.8) + (3 * 0.2)
      } else {
        // No data available, use default mid-point
        weightedAvg = 3
      }
      
      // Convert from 1-5 scale to 0-100 scale:
      // 1 -> 0, 2 -> 25, 3 -> 50, 4 -> 75, 5 -> 100
      const finalProficiencyScore = Math.round(((weightedAvg - 1) / 4) * 100)
      
      console.log(`Player ${userId} - Final score: ${finalProficiencyScore} (from weighted avg: ${weightedAvg.toFixed(2)})`)
      
      // Update player's proficiency score
      updates.push(
        db.userCompetition.updateMany({
          where: {
            userId,
            competitionId
          },
          data: {
            proficiencyScore: finalProficiencyScore
          }
        })
      )
    }
    
    // Execute all updates
    await Promise.all(updates)
    
    // Revalidate relevant paths
    revalidatePath('/admin/players')
    revalidatePath('/admin/teams')
    
    return NextResponse.json({
      success: true,
      updatedPlayers: registeredPlayers.length
    })
  } catch (error) {
    console.error("Error generating player scores:", error)
    return NextResponse.json(
      { error: "Failed to generate player scores" },
      { status: 500 }
    )
  }
} 