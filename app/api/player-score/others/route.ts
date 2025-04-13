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
    const { phaseId, scores } = body

    if (!phaseId || !scores) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify the phase exists and is of type player_scoring
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

    if (phase.type !== "player_scoring") {
      return NextResponse.json(
        { error: "This phase does not support player scoring" },
        { status: 400 }
      )
    }

    // Add logging before the status check
    console.log(`[API /player-score/others] Checking status for phaseId: ${phaseId}. Retrieved phase object:`, JSON.stringify(phase));

    if (phase.status !== "in-progress") {
      console.error(`[API /player-score/others] Phase status check failed for phaseId: ${phaseId}. Status found: '${phase.status}'`); // Log the failure
      return NextResponse.json(
        { error: "This phase is not currently active" },
        { status: 400 }
      )
    }

    // Get all player IDs from the scores object
    const playerIds = Object.keys(scores)
    
    // For each player being rated
    for (const playerId of playerIds) {
      // Check if the player exists
      const player = await db.user.findUnique({
        where: { id: playerId }
      })
      
      if (!player) {
        continue; // Skip if player doesn't exist
      }
      
      // Check if rating already exists for this player by this user
      const existingRating = await db.playerRating.findFirst({
        where: {
          raterId: session.user.id,
          ratedId: playerId,
          phaseId: phase.id
        }
      })
      
      if (existingRating) {
        // Update existing rating
        await db.playerRating.update({
          where: { id: existingRating.id },
          data: {
            scores: scores[playerId],
            updatedAt: new Date()
          }
        })
      } else {
        // Create new rating
        await db.playerRating.create({
          data: {
            raterId: session.user.id,
            ratedId: playerId,
            phaseId: phase.id,
            competitionId: phase.competitionId,
            scores: scores[playerId]
          }
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving player ratings:", error)
    return NextResponse.json(
      { error: "Failed to save ratings" },
      { status: 500 }
    )
  }
} 