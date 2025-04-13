import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/auth'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    const currentUserId = session.user.id; // Get current user ID

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const withoutTeam = searchParams.get('withoutTeam') === 'true'
    const competitionId = searchParams.get('competitionId') // Get competitionId
    
    // Build query
    const where: any = {}
    
    // Filter players without a team if requested
    if (withoutTeam) {
      where.teamId = null
    }
    
    // Filter players by competition registration if competitionId is provided
    if (competitionId) {
      where.competitions = {
        some: {
          competitionId: competitionId,
        },
      }
    }
    
    // Get players from database
    const players = await db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        image: true,
        role: true,
        teamId: true,
        position: true,
        // Include the user's competition data to get proficiency scores
        competitions: competitionId ? {
          where: { competitionId },
          select: {
            proficiencyScore: true,
            proficiencies: true
          }
        } : undefined
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    // Format the results to include userCompetition
    const formattedPlayers = players.map(player => {
      const userCompetition = competitionId && player.competitions && player.competitions[0] 
        ? player.competitions[0] 
        : null;
      
      return {
        id: player.id,
        name: player.name,
        image: player.image,
        role: player.role,
        teamId: player.teamId,
        position: player.position,
        userCompetition
      };
    });
    
    // Filter out the current user if fetching for scoring others in a specific competition
    const filteredPlayers = competitionId 
      ? formattedPlayers.filter(player => player.id !== currentUserId) 
      : formattedPlayers;

    return NextResponse.json({ players: filteredPlayers }) // Return players in an object
  } catch (error) {
    console.error("Error fetching players:", error)
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 }
    )
  }
} 