'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'

/**
 * Get event management configuration for a competition
 */
export async function getEventManagement(competitionId: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized: Only admins can access event management')
  }

  try {
    // Validate competitionId is a valid ObjectId
    if (!competitionId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Invalid competition ID format')
    }
    
    // First try to get existing event management
    let eventManagement = await db.eventManagement.findUnique({
      where: { competitionId },
      include: { 
        competition: true,
        currentPhase: true
      }
    })

    // If not found, create a new one with default values
    if (!eventManagement) {
      // Get the competition first
      const competition = await db.competition.findUnique({
        where: { id: competitionId }
      })
      
      if (!competition) {
        throw new Error('Competition not found')
      }

      // Create default phases
      const phaseData = [
        {
          name: 'Player Registration',
          description: 'Players can register for the competition',
          status: 'in-progress',
          startDate: new Date(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          order: 1,
          competitionId,
          type: 'registration'
        },
        {
          name: 'Player Scoring',
          description: 'Players score themselves and other players',
          status: 'pending',
          startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
          order: 2,
          competitionId,
          type: 'player_scoring'
        },
        {
          name: 'Team Forming',
          description: 'Teams are formed and balanced',
          status: 'pending',
          startDate: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
          order: 3,
          competitionId,
          type: 'team_formation'
        },
        {
          name: 'Captain Voting',
          description: 'Team members vote for their captains',
          status: 'pending',
          startDate: new Date(Date.now() + 43 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 49 * 24 * 60 * 60 * 1000),
          order: 4,
          competitionId,
          type: 'captain_voting'
        },
        {
          name: 'Game Selection',
          description: 'Games are selected and scheduled for the competition',
          status: 'pending',
          startDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 56 * 24 * 60 * 60 * 1000),
          order: 5,
          competitionId,
          type: 'game_selection'
        },
        {
          name: 'Competition',
          description: 'Games are being played and scores are recorded',
          status: 'pending',
          startDate: new Date(Date.now() + 57 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 87 * 24 * 60 * 60 * 1000),
          order: 6,
          competitionId,
          type: 'competition'
        },
        {
          name: 'Award Ceremony',
          description: 'Winners are announced and awards are presented',
          status: 'pending',
          startDate: new Date(Date.now() + 88 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          order: 7,
          competitionId,
          type: 'award_ceremony'
        }
      ]

      // Create the phases
      const phases = await Promise.all(
        phaseData.map(phase => db.competitionPhase.create({ data: phase }))
      )

      // Find the first phase (Registration)
      const firstPhase = phases.find(p => p.name === 'Player Registration')

      // Create new event management record with default settings
      eventManagement = await db.eventManagement.create({
        data: {
          competitionId,
          currentPhaseId: firstPhase?.id,
          settings: {
            enablePlayerRegistration: true,
            enableTeamFormation: false,
            enableCaptainVoting: false,
            enableGameScheduling: false
          }
        },
        include: { 
          competition: true,
          currentPhase: true
        }
      })
    }

    // Also fetch all phases for this competition
    const phases = await db.competitionPhase.findMany({
      where: { competitionId },
      orderBy: { order: 'asc' }
    })

    return { ...eventManagement, phases }
  } catch (error) {
    console.error('Error getting event management:', error)
    throw new Error('Failed to get event management configuration')
  }
}

/**
 * Update event management settings
 */
export async function updateEventManagement(competitionId: string, data: any) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized: Only admins can update event management')
  }

  try {
    const updated = await db.eventManagement.update({
      where: { competitionId },
      data
    })

    revalidatePath('/admin/event-management')
    return updated
  } catch (error) {
    console.error('Error updating event management:', error)
    throw new Error('Failed to update event management configuration')
  }
}

/**
 * Update current phase
 */
export async function updateCurrentPhase(competitionId: string, phaseId: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized: Only admins can update competition phases')
  }

  try {
    // Get the phase to make active
    const phase = await db.competitionPhase.findUnique({
      where: { id: phaseId }
    })

    if (!phase) {
      throw new Error('Phase not found')
    }

    // Update this phase to in-progress
    await db.competitionPhase.update({
      where: { id: phaseId },
      data: { status: 'in-progress' }
    })

    // Get the current active phase
    const eventManagement = await db.eventManagement.findUnique({
      where: { competitionId },
      include: { currentPhase: true }
    })

    if (!eventManagement) {
      throw new Error('Event management not found')
    }

    // If there was a different active phase, mark it as completed
    if (eventManagement.currentPhaseId && eventManagement.currentPhaseId !== phaseId) {
      await db.competitionPhase.update({
        where: { id: eventManagement.currentPhaseId },
        data: { status: 'completed' }
      })
    }

    // Update event management to point to the new current phase
    const updated = await db.eventManagement.update({
      where: { competitionId },
      data: {
        currentPhaseId: phaseId
      },
      include: { currentPhase: true }
    })

    revalidatePath('/admin/event-management')
    return updated
  } catch (error) {
    console.error('Error updating current phase:', error)
    throw new Error('Failed to update current phase')
  }
}

/**
 * Add a competition phase
 */
export async function addCompetitionPhase(data: any) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized: Only admins can add competition phases')
  }

  try {
    const phase = await db.competitionPhase.create({
      data
    })

    revalidatePath('/admin/event-management')
    return phase
  } catch (error) {
    console.error('Error adding competition phase:', error)
    throw new Error('Failed to add competition phase')
  }
}

/**
 * Update a competition phase
 */
export async function updateCompetitionPhase(id: string, data: any) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized: Only admins can update competition phases')
  }

  try {
    const phase = await db.competitionPhase.update({
      where: { id },
      data
    })

    revalidatePath('/admin/event-management')
    return phase
  } catch (error) {
    console.error('Error updating competition phase:', error)
    throw new Error('Failed to update competition phase')
  }
}

/**
 * Delete a competition phase
 */
export async function deleteCompetitionPhase(id: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized: Only admins can delete competition phases')
  }

  try {
    await db.competitionPhase.delete({
      where: { id }
    })

    revalidatePath('/admin/event-management')
    return { success: true }
  } catch (error) {
    console.error('Error deleting competition phase:', error)
    throw new Error('Failed to delete competition phase')
  }
} 