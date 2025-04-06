'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

/**
 * Get dashboard statistics for the current user
 */
export async function getDashboardStats() {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized: You must be logged in to view dashboard data')
  }

  try {
    // Get active competition
    const activeCompetition = await db.competition.findFirst({
      where: { status: 'active' }
    })

    if (!activeCompetition) {
      throw new Error('No active competition found')
    }

    // Get team count
    const teamCount = await db.team.count({
      where: { competitionId: activeCompetition.id }
    })

    // Get player count
    const playerCount = await db.user.count({
      where: { role: 'player' }
    })

    // Get scheduled games count
    const scheduledGamesCount = await db.game.count({
      where: { 
        competitionId: activeCompetition.id,
        status: 'scheduled'
      }
    })

    // Get completed games count
    const completedGamesCount = await db.game.count({
      where: { 
        competitionId: activeCompetition.id,
        status: 'completed'
      }
    })

    // Calculate days remaining in competition
    const daysRemaining = Math.max(
      0,
      Math.ceil((new Date(activeCompetition.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    )

    // Get top teams by score
    const topTeams = await db.team.findMany({
      where: { competitionId: activeCompetition.id },
      orderBy: { score: 'desc' },
      take: 5,
      include: {
        captain: {
          select: { id: true, name: true, image: true }
        }
      }
    })

    // Get top players by score
    const topPlayers = await db.user.findMany({
      where: { role: 'player' },
      orderBy: { proficiencyScore: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        image: true,
        proficiencyScore: true,
        teamId: true,
        team: {
          select: { name: true }
        }
      }
    })

    // Get recent games
    const recentGames = await db.game.findMany({
      where: { competitionId: activeCompetition.id },
      orderBy: [
        { status: 'asc' },
        { date: 'asc' }
      ],
      take: 5,
      include: {
        team1: true,
        team2: true
      }
    })

    // Get user's team data if they belong to one
    let userTeam = null
    if (session.user.teamId) {
      userTeam = await db.team.findUnique({
        where: { id: session.user.teamId },
        include: {
          captain: {
            select: { id: true, name: true, image: true }
          },
          members: {
            select: { id: true, name: true, image: true, proficiencyScore: true }
          }
        }
      })
    }

    return {
      stats: {
        teamCount,
        playerCount,
        scheduledGamesCount,
        completedGamesCount,
        daysRemaining
      },
      topTeams,
      topPlayers,
      recentGames,
      userTeam,
      competition: activeCompetition
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    throw new Error('Failed to fetch dashboard data')
  }
}

/**
 * Get competition timeline phases
 */
export async function getCompetitionTimeline() {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized: You must be logged in to view competition timeline')
  }

  try {
    // Get active competition
    const activeCompetition = await db.competition.findFirst({
      where: { status: 'active' }
    })

    if (!activeCompetition) {
      throw new Error('No active competition found')
    }

    // Get or create event management for active competition
    let eventManagement = await db.eventManagement.findUnique({
      where: { competitionId: activeCompetition.id }
    })

    if (!eventManagement) {
      // Create default phases
      const defaultPhases = [
        {
          name: 'Registration',
          status: 'in-progress',
          startDate: new Date(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          description: 'Deadline for players to register for the competition'
        },
        {
          name: 'Team Formation',
          status: 'pending',
          startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
          description: 'Teams are formed and players are assigned'
        },
        {
          name: 'Captain Selection',
          status: 'pending',
          startDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          description: 'Team members vote for their captains'
        },
        {
          name: 'Game Selection',
          status: 'pending',
          startDate: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 38 * 24 * 60 * 60 * 1000),
          description: 'Teams select which games they will participate in'
        },
        {
          name: 'Competition',
          status: 'pending',
          startDate: new Date(Date.now() + 39 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 69 * 24 * 60 * 60 * 1000),
          description: 'Official competition games period'
        },
        {
          name: 'Awards Ceremony',
          status: 'pending',
          startDate: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 70 * 24 * 60 * 60 * 1000),
          description: 'Recognition of teams and players'
        }
      ]

      // Create new event management record
      eventManagement = await db.eventManagement.create({
        data: {
          competitionId: activeCompetition.id,
          phases: defaultPhases,
          currentPhase: 'Registration',
          timeline: {
            start: activeCompetition.startDate,
            end: activeCompetition.endDate
          },
          settings: {
            enablePlayerRegistration: true,
            enableTeamFormation: false,
            enableCaptainVoting: false,
            enableGameScheduling: false
          }
        }
      })
    }

    // Format the phases for the timeline
    const phases = (eventManagement.phases as any[]).map(phase => ({
      id: phase.name.toLowerCase().replace(/ /g, '_'),
      title: phase.name,
      date: phase.endDate,
      status: phase.status as 'completed' | 'active' | 'upcoming',
      description: phase.description || `Phase: ${phase.name}`
    }))

    return {
      competition: activeCompetition,
      phases
    }
  } catch (error) {
    console.error('Error fetching competition timeline:', error)
    throw new Error('Failed to fetch competition timeline')
  }
} 