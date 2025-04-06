'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

/**
 * Update a competition phase deadline
 */
export async function updatePhaseDeadline(
  phaseId: string, 
  startDate: string, 
  endDate: string
) {
  const session = await auth()
  
  // Check if the user is authenticated and is an admin
  if (!session?.user?.id || session.user.role !== 'admin') {
    throw new Error('Unauthorized: Only admins can update phase deadlines')
  }
  
  try {
    // Update the phase with new dates
    const updatedPhase = await db.competitionPhase.update({
      where: { id: phaseId },
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      }
    })
    
    // Recalculate phase status based on new dates
    const now = new Date()
    const phaseStartDate = new Date(updatedPhase.startDate)
    const phaseEndDate = new Date(updatedPhase.endDate)
    
    let status = 'pending'
    if (now >= phaseStartDate && now <= phaseEndDate) {
      status = 'in-progress'
    } else if (now > phaseEndDate) {
      status = 'completed'
    }
    
    // Update the status if it has changed
    if (status !== updatedPhase.status) {
      await db.competitionPhase.update({
        where: { id: phaseId },
        data: { status }
      })
    }
    
    // Get the competition id to revalidate the right paths
    const competition = await db.competitionPhase.findUnique({
      where: { id: phaseId },
      select: { competitionId: true }
    })
    
    // Revalidate paths that might display this data
    revalidatePath('/dashboard')
    if (competition?.competitionId) {
      revalidatePath(`/competitions/${competition.competitionId}`)
    }
    revalidatePath('/competitions')
    
    return { success: true }
  } catch (error) {
    console.error('Error updating phase deadline:', error)
    throw new Error('Failed to update phase deadline')
  }
}

/**
 * Create a new competition phase
 */
export async function createCompetitionPhase(data: {
  competitionId: string
  name: string
  description?: string
  startDate: string
  endDate: string
  order: number
}) {
  const session = await auth()
  
  // Check if the user is authenticated and is an admin
  if (!session?.user?.id || session.user.role !== 'admin') {
    throw new Error('Unauthorized: Only admins can create competition phases')
  }
  
  try {
    const { competitionId, name, description, startDate, endDate, order } = data
    
    // Calculate initial status
    const now = new Date()
    const phaseStartDate = new Date(startDate)
    const phaseEndDate = new Date(endDate)
    
    let status = 'pending'
    if (now >= phaseStartDate && now <= phaseEndDate) {
      status = 'in-progress'
    } else if (now > phaseEndDate) {
      status = 'completed'
    }
    
    // Create the new phase
    const newPhase = await db.competitionPhase.create({
      data: {
        competitionId,
        name,
        description,
        startDate: phaseStartDate,
        endDate: phaseEndDate,
        status,
        order
      }
    })
    
    // Revalidate paths
    revalidatePath('/dashboard')
    revalidatePath(`/competitions/${competitionId}`)
    revalidatePath('/competitions')
    
    return newPhase
  } catch (error) {
    console.error('Error creating competition phase:', error)
    throw new Error('Failed to create competition phase')
  }
}

/**
 * Delete a competition phase
 */
export async function deleteCompetitionPhase(phaseId: string) {
  const session = await auth()
  
  // Check if the user is authenticated and is an admin
  if (!session?.user?.id || session.user.role !== 'admin') {
    throw new Error('Unauthorized: Only admins can delete competition phases')
  }
  
  try {
    // Get the competition id before deleting the phase
    const phase = await db.competitionPhase.findUnique({
      where: { id: phaseId },
      select: { competitionId: true }
    })
    
    if (!phase) {
      throw new Error('Phase not found')
    }
    
    // Delete the phase
    await db.competitionPhase.delete({
      where: { id: phaseId }
    })
    
    // Revalidate paths
    revalidatePath('/dashboard')
    revalidatePath(`/competitions/${phase.competitionId}`)
    revalidatePath('/competitions')
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting competition phase:', error)
    throw new Error('Failed to delete competition phase')
  }
} 