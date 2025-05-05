import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/auth'

export async function GET(request: Request) {
  try {
    // Authenticate user
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // Only admins can access player data
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized: Only admins can access player data" },
        { status: 403 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const competitionId = searchParams.get('competitionId')
    
    if (!competitionId) {
      return NextResponse.json(
        { error: "Competition ID is required" },
        { status: 400 }
      )
    }

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
    
    // Get all players for the competition with their user info
    const players = await db.userCompetition.findMany({
      where: { competitionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            teamId: true
          }
        }
      },
      orderBy: {
        user: {
          name: 'asc'
        }
      }
    })
    
    // Enhanced player data with team names
    const teamIds = players
      .filter(p => p.user.teamId)
      .map(p => p.user.teamId)
      .filter((id): id is string => id !== null && id !== undefined)
    
    // Create a map of team IDs to team names if there are teams
    const teamMap: Record<string, string> = {}
    
    if (teamIds.length > 0) {
      const teams = await db.team.findMany({
        where: {
          id: { in: teamIds }
        },
        select: {
          id: true,
          name: true
        }
      })
      
      teams.forEach(team => {
        teamMap[team.id] = team.name
      })
    }
    
    // Return the players with enhanced data
    return NextResponse.json(players.map(player => ({
      ...player,
      teamName: player.user.teamId ? teamMap[player.user.teamId] || 'Unknown Team' : null
    })))
  } catch (error) {
    console.error("Error fetching players:", error)
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 }
    )
  }
} 