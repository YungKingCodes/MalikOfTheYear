import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function POST(req: NextRequest) {
  const session = await auth()
  
  // Only admins can swap players
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await req.json()
    const { sourceTeamId, targetTeamId, playerId } = body
    
    // Validate required fields
    if (!sourceTeamId || !targetTeamId || !playerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Check if teams exist
    const sourceTeam = await db.team.findUnique({
      where: { id: sourceTeamId },
      select: { id: true, competitionId: true, captainId: true }
    })
    
    const targetTeam = await db.team.findUnique({
      where: { id: targetTeamId },
      select: { id: true, competitionId: true }
    })
    
    if (!sourceTeam || !targetTeam) {
      return NextResponse.json(
        { error: 'One or both teams not found' },
        { status: 404 }
      )
    }
    
    // Check if the teams are in the same competition
    if (sourceTeam.competitionId !== targetTeam.competitionId) {
      return NextResponse.json(
        { error: 'Teams must be in the same competition' },
        { status: 400 }
      )
    }
    
    // Check if the player exists
    const player = await db.user.findUnique({
      where: { id: playerId },
      select: { id: true, teamId: true }
    })
    
    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      )
    }
    
    // Verify player is in the source team
    if (player.teamId !== sourceTeamId) {
      return NextResponse.json(
        { error: 'Player is not in the source team' },
        { status: 400 }
      )
    }
    
    // Check if player is the captain of the source team
    if (sourceTeam.captainId === playerId) {
      return NextResponse.json(
        { error: 'Cannot move the team captain. Please assign a new captain first.' },
        { status: 400 }
      )
    }
    
    // Swap the player to the new team
    const updatedPlayer = await db.user.update({
      where: { id: playerId },
      data: { teamId: targetTeamId }
    })
    
    // Revalidate relevant paths
    revalidatePath('/admin/teams')
    revalidatePath(`/admin/teams/${sourceTeamId}`)
    revalidatePath(`/admin/teams/${targetTeamId}`)
    revalidatePath('/dashboard')
    
    return NextResponse.json({
      success: true,
      message: 'Player moved successfully',
      player: {
        id: updatedPlayer.id,
        name: updatedPlayer.name,
        newTeamId: targetTeamId
      }
    })
  } catch (error) {
    console.error('Error swapping player:', error)
    return NextResponse.json(
      { error: 'Failed to swap player' },
      { status: 500 }
    )
  }
} 