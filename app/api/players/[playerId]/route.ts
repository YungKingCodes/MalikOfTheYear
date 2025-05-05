import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { playerId: string } }
) {
  try {
    // Get player ID from route parameters
    const playerId = params.playerId
    
    if (!playerId) {
      return NextResponse.json({ error: "Player ID is required" }, { status: 400 })
    }
    
    // Authenticate user
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Only admins can update player scores
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized: Only admins can update player scores" },
        { status: 403 }
      )
    }
    
    // Get request data
    const data = await request.json()
    
    if (!data || !data.competitionId) {
      return NextResponse.json({ error: "Competition ID is required" }, { status: 400 })
    }
    
    // Extract data from request
    const { competitionId, proficiencyScore } = data
    
    // Verify proficiency score is a number between 0 and 100
    if (proficiencyScore === undefined || proficiencyScore === null || 
        typeof proficiencyScore !== 'number' || 
        proficiencyScore < 0 || proficiencyScore > 100) {
      return NextResponse.json(
        { error: "Proficiency score must be a number between 0 and 100" },
        { status: 400 }
      )
    }
    
    // Verify the player exists in the user table
    const user = await db.user.findUnique({
      where: { id: playerId }
    })
    
    if (!user) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
    }
    
    // Verify the player is registered for the competition
    const userCompetition = await db.userCompetition.findFirst({
      where: {
        userId: playerId,
        competitionId
      }
    })
    
    if (!userCompetition) {
      return NextResponse.json(
        { error: "Player is not registered for this competition" },
        { status: 404 }
      )
    }
    
    // Update the player's proficiency score
    await db.userCompetition.updateMany({
      where: {
        userId: playerId,
        competitionId
      },
      data: {
        proficiencyScore: Math.round(proficiencyScore)
      }
    })
    
    // Revalidate relevant paths
    revalidatePath('/admin/players')
    revalidatePath('/admin/teams')
    
    return NextResponse.json({
      success: true,
      playerId,
      proficiencyScore: Math.round(proficiencyScore)
    })
  } catch (error) {
    console.error("Error updating player:", error)
    return NextResponse.json(
      { error: "Failed to update player" },
      { status: 500 }
    )
  }
} 