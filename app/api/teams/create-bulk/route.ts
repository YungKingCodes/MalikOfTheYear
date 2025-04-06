import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/auth'

export async function POST(request: Request) {
  try {
    // Authenticate user
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized: Only admins can create teams" },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { phaseId, competitionId, teams } = body

    if (!phaseId || !competitionId || !teams || !Array.isArray(teams)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify the phase exists and is of type team_formation
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

    if (phase.type !== "team_formation") {
      return NextResponse.json(
        { error: "This phase does not support team formation" },
        { status: 400 }
      )
    }

    if (phase.status !== "in-progress") {
      return NextResponse.json(
        { error: "This phase is not currently active" },
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

    // Begin transaction to create teams and assign players
    const result = await db.$transaction(async (tx) => {
      const createdTeams = [];
      
      // First, get all players that will be assigned to teams
      const allPlayerIds = teams.flatMap(team => team.playerIds);
      
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
      });
      
      if (existingTeamAssignments.length > 0) {
        // Some players already have teams, we need to remove them first
        await tx.user.updateMany({
          where: {
            id: { in: existingTeamAssignments.map(p => p.id) }
          },
          data: {
            teamId: null
          }
        });
      }
      
      // Create each team and assign players
      for (const team of teams) {
        if (!team.name || !team.playerIds || !Array.isArray(team.playerIds)) {
          continue;
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
        });
        
        // Update each player to be part of this team
        await tx.user.updateMany({
          where: {
            id: { in: team.playerIds }
          },
          data: {
            teamId: createdTeam.id
          }
        });
        
        createdTeams.push(createdTeam);
      }
      
      return createdTeams;
    });

    return NextResponse.json({ 
      success: true,
      teams: result
    });
  } catch (error) {
    console.error("Error creating teams:", error)
    return NextResponse.json(
      { error: "Failed to create teams" },
      { status: 500 }
    )
  }
} 