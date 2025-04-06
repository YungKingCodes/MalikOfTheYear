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

    if (phase.status !== "in-progress") {
      return NextResponse.json(
        { error: "This phase is not currently active" },
        { status: 400 }
      )
    }

    // Check if user has already submitted self-scores for this phase
    const existingScores = await db.playerSelfScore.findFirst({
      where: {
        userId: session.user.id,
        phaseId: phase.id
      }
    })

    // Update or create player self-scores
    if (existingScores) {
      // Update existing scores
      await db.playerSelfScore.update({
        where: { id: existingScores.id },
        data: {
          scores: scores,
          updatedAt: new Date()
        }
      })
    } else {
      // Create new scores
      await db.playerSelfScore.create({
        data: {
          userId: session.user.id,
          phaseId: phase.id,
          competitionId: phase.competitionId,
          scores: scores
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving player self-scores:", error)
    return NextResponse.json(
      { error: "Failed to save scores" },
      { status: 500 }
    )
  }
} 