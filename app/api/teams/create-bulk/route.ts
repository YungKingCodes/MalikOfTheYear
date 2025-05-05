import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/auth'

export async function POST(request: Request) {
  try {
    // Check authorization
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can create teams" }, { status: 403 })
    }
    
    // Get request data
    const data = await request.json()
    
    if (!data) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 })
    }
    
    const { competitionId, teams, method } = data
    
    if (!competitionId) {
      return NextResponse.json({ error: "Competition ID is required" }, { status: 400 })
    }
    
    // Verify competition exists
    const competition = await db.competition.findUnique({
      where: { id: competitionId }
    })
    
    if (!competition) {
      return NextResponse.json({ error: "Competition not found" }, { status: 404 })
    }
    
    // Check if auto-formation or manual formation
    if (method === "auto") {
      const teamCount = data.teamCount || 4
      
      if (teamCount < 2) {
        return NextResponse.json(
          { error: "Team count must be at least 2" },
          { status: 400 }
        )
      }
      
      // Get all registered players for the competition
      const registeredPlayers = await db.userCompetition.findMany({
        where: {
          competitionId: competitionId,
          status: 'registered'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })

      // Extract user data
      const players = registeredPlayers.map(rp => ({
        id: rp.user.id,
        name: rp.user.name
      }))

      if (players.length < teamCount * 2) {
        return NextResponse.json(
          { error: "Not enough registered players to create balanced teams" },
          { status: 400 }
        )
      }

      // Shuffle players randomly for balanced distribution
      for (let i = players.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [players[i], players[j]] = [players[j], players[i]];
      }

      // Create empty teams
      const teamPlayers: string[][] = Array(teamCount).fill(null).map(() => [])

      // Distribute players using serpentine method to balance teams
      let teamIndex = 0
      let direction = 1

      for (const player of players) {
        teamPlayers[teamIndex].push(player.id)
        
        teamIndex += direction
        
        if (teamIndex === teamCount - 1 || teamIndex === 0) {
          direction *= -1 // Reverse direction at the ends
        }
      }

      // Format teams for creation
      const teamsToCreate = teamPlayers.map((playerIds, index) => ({
        name: `Team ${index + 1}`,
        playerIds
      }))

      // Create teams using transaction
      const result = await createTeams(teamsToCreate, competitionId)

      return NextResponse.json({ 
        success: true,
        formationType: 'random',
        teams: result
      })
    } else {
      // For manual formation, use the provided teams
      const result = await createTeams(teams, competitionId)

      return NextResponse.json({ 
        success: true,
        formationType: 'manual',
        teams: result
      })
    }
  } catch (error) {
    console.error("Error creating teams:", error)
    return NextResponse.json(
      { error: "Failed to create teams" },
      { status: 500 }
    )
  }
}

// Helper function to create teams in a transaction
async function createTeams(teams: any[], competitionId: string) {
  return await db.$transaction(async (tx) => {
    const createdTeams = []
    
    // First, get all players that will be assigned to teams
    const allPlayerIds = teams.flatMap(team => team.playerIds)
    
    // Check if any players are already on a team
    const existingTeamAssignments = await tx.user.findMany({
      where: {
        id: { in: allPlayerIds },
        teamId: { not: null }
      },
      select: {
        id: true,
        name: true,
        teamId: true
      }
    })
    
    if (existingTeamAssignments.length > 0) {
      // Some players already have teams, we need to remove them first
      await tx.user.updateMany({
        where: {
          id: { in: existingTeamAssignments.map(p => p.id) }
        },
        data: {
          teamId: null
        }
      })
    }
    
    // Create each team and assign players
    for (const team of teams) {
      if (!team.name || !team.playerIds || !Array.isArray(team.playerIds)) {
        continue
      }
      
      // Create the team
      const createdTeam = await tx.team.create({
        data: {
          name: team.name,
          competitionId: competitionId,
          memberIds: team.playerIds,
          // Set default values for other required fields
          score: 0,
          maxScore: 1500,
          winRate: 0
        }
      })
      
      // Update each player to be part of this team
      await tx.user.updateMany({
        where: {
          id: { in: team.playerIds }
        },
        data: {
          teamId: createdTeam.id
        }
      })
      
      createdTeams.push(createdTeam)
    }
    
    return createdTeams
  })
} 