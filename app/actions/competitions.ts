'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { notFound } from 'next/navigation'

/**
 * Get all competitions with optional filters
 */
export async function getCompetitions({ year, status }: { year?: number; status?: string } = {}) {
  try {
    const where: any = {}
    
    if (year) {
      where.year = year
    }
    
    if (status) {
      where.status = status
    }
    
    const competitions = await db.competition.findMany({
      where,
      orderBy: {
        year: 'desc'
      },
      include: {
        teams: true
      }
    })
    
    return competitions.map(competition => ({
      id: competition.id,
      name: competition.name,
      year: competition.year,
      startDate: competition.startDate.toISOString(),
      endDate: competition.endDate.toISOString(),
      status: competition.status,
      description: competition.description,
      teams: competition.teams || [],
      winnerId: competition.winnerId,
      goatId: competition.goatId,
      teamIds: competition.teamIds || [],
      gameIds: competition.gameIds || []
    }))
  } catch (error) {
    console.error('Failed to fetch competitions:', error)
    return []
  }
}

/**
 * Get competition by ID
 */
export async function getCompetitionById(id: string) {
  try {
    const competition = await db.competition.findUnique({
      where: { id },
      include: {
        teams: true,
        games: true,
        phases: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })
    
    if (!competition) {
      throw new Error('Competition not found')
    }
    
    return {
      id: competition.id,
      name: competition.name,
      year: competition.year,
      startDate: competition.startDate.toISOString(),
      endDate: competition.endDate.toISOString(),
      status: competition.status,
      description: competition.description,
      teams: competition.teams,
      games: competition.games,
      phases: competition.phases,
      winnerId: competition.winnerId,
      goatId: competition.goatId
    }
  } catch (error) {
    console.error('Failed to fetch competition details:', error)
    throw new Error('Failed to fetch competition details')
  }
}

/**
 * Create a new competition
 */
export async function createCompetition(data: {
  name: string
  year: number
  startDate: string
  endDate: string
  description: string
  status?: string
}) {
  const session = await auth()
  
  // Check if the user is authenticated and is an admin
  if (!session?.user?.id || session.user.role !== 'admin') {
    console.error('Unauthorized attempt to create competition:', 
      { userId: session?.user?.id, role: session?.user?.role });
    throw new Error('Unauthorized: Only admins can create competitions')
  }
  
  try {
    const { name, year, startDate, endDate, description, status } = data
    
    // Validate all required fields
    if (!name || !year || !startDate || !endDate) {
      const missingFields = [];
      if (!name) missingFields.push('name');
      if (!year) missingFields.push('year');
      if (!startDate) missingFields.push('startDate');
      if (!endDate) missingFields.push('endDate');
      
      console.error('Missing required fields when creating competition:', { missingFields });
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
    }
    
    // Validate date formats
    let startDateObj, endDateObj;
    try {
      startDateObj = new Date(startDate);
      endDateObj = new Date(endDate);
      
      if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
        throw new Error('Invalid date format');
      }
      
      // Check date range
      if (endDateObj <= startDateObj) {
        throw new Error('End date must be after start date');
      }
    } catch (dateError) {
      console.error('Date validation error when creating competition:', dateError);
      throw new Error(`Invalid date format: ${dateError instanceof Error ? dateError.message : 'Unknown error'}`);
    }
    
    // Check if a competition with this year already exists
    const existingCompetition = await db.competition.findFirst({
      where: { 
        AND: [
          { name: { equals: name, mode: 'insensitive' } },
          { year: year }
        ]
      }
    })
    
    if (existingCompetition) {
      console.error('Attempted to create duplicate competition with same name and year:', { name, year });
      throw new Error(`A competition named "${name}" for year ${year} already exists. Please use a unique name.`)
    }
    
    // Create the competition
    console.log('Creating new competition:', { 
      name, 
      year, 
      status: status || 'inactive'
    });
    
    const competition = await db.competition.create({
      data: {
        name,
        year,
        startDate: startDateObj,
        endDate: endDateObj,
        description: description || '',
        status: status || 'inactive', // Default to inactive if not specified
        teamIds: [],
        gameIds: []
      }
    })
    
    console.log('Competition created successfully:', { id: competition.id, name: competition.name });
    
    revalidatePath('/competitions')
    revalidatePath('/dashboard')
    revalidatePath('/admin/competitions')
    
    return competition
  } catch (error) {
    // Detailed error logging
    console.error('Failed to create competition:', error);
    
    // Return a more specific error message if possible
    if (error instanceof Error) {
      throw new Error(`Failed to create competition: ${error.message}`);
    } else {
      throw new Error('Failed to create competition: Unknown error occurred');
    }
  }
}

/**
 * Get a competition by year
 */
export async function getCompetitionByYear(year: number) {
  try {
    // Find competition with matching year
    const competition = await db.competition.findFirst({
      where: { year },
      include: {
        teams: {
          include: {
            captain: {
              select: {
                id: true,
                name: true,
                image: true
              }
            },
            members: {
              select: {
                id: true,
                name: true,
                image: true,
                proficiencyScore: true
              }
            }
          }
        },
        games: {
          include: {
            participants: {
              include: {
                team: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        },
        phases: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })
    
    if (!competition) {
      return null
    }
    
    // Find top players from this competition
    const topPlayers = await db.user.findMany({
      where: {
        team: {
          competitionId: competition.id
        }
      },
      orderBy: {
        proficiencyScore: 'desc'
      },
      take: 5,
      select: {
        id: true,
        name: true,
        image: true,
        proficiencyScore: true,
        titles: true,
        team: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    
    // Calculate some stats about the competition
    const totalTeams = competition.teams.length
    const totalPlayers = competition.teams.reduce((count, team) => count + team.members.length, 0)
    const totalGames = competition.games.length
    const completedGames = competition.games.filter(game => game.status === 'completed').length
    
    // Find the winner team (if competition is completed)
    let winnerTeam = null
    if (competition.status === 'completed' && competition.winnerId) {
      winnerTeam = competition.teams.find(team => team.id === competition.winnerId)
    }
    
    // Find GOAT player (if competition is completed)
    let goatPlayer = null
    if (competition.status === 'completed' && competition.goatId) {
      goatPlayer = await db.user.findUnique({
        where: { id: competition.goatId },
        select: {
          id: true,
          name: true,
          image: true,
          team: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })
    }
    
    // Create the structured result
    return {
      id: competition.id,
      name: competition.name,
      year: competition.year,
      startDate: competition.startDate,
      endDate: competition.endDate,
      status: competition.status,
      description: competition.description,
      winner: winnerTeam ? {
        id: winnerTeam.id,
        name: winnerTeam.name,
        score: winnerTeam.score,
        captainId: winnerTeam.captainId,
        captainName: winnerTeam.captain?.name
      } : null,
      goat: goatPlayer,
      stats: {
        totalTeams,
        totalPlayers,
        totalGames,
        completedGames
      },
      teams: competition.teams.map(team => ({
        id: team.id,
        name: team.name,
        score: team.score,
        captainName: team.captain?.name,
        memberCount: team.members.length
      })),
      games: competition.games.map(game => {
        // Find participating teams
        const participants = game.participants || []
        const team1 = participants.length > 0 ? participants[0].team : null
        const team2 = participants.length > 1 ? participants[1].team : null
        
        return {
          id: game.id,
          name: game.name,
          type: game.type,
          category: game.category,
          status: game.status,
          date: game.date,
          location: game.location || 'Main Arena',
          pointsValue: game.pointsValue,
          team1: team1 ? { id: team1.id, name: team1.name } : null,
          team2: team2 ? { id: team2.id, name: team2.name } : null
        }
      }),
      phases: competition.phases.map(phase => ({
        id: phase.id,
        name: phase.name,
        description: phase.description,
        startDate: phase.startDate,
        endDate: phase.endDate,
        status: phase.status,
        order: phase.order
      })),
      topPlayers: topPlayers.map(player => ({
        id: player.id,
        name: player.name,
        image: player.image,
        score: player.proficiencyScore,
        titles: player.titles,
        teamName: player.team?.name
      }))
    }
  } catch (error) {
    console.error('Error fetching competition by year:', error)
    throw new Error('Failed to fetch competition details')
  }
}

/**
 * Update an existing competition
 */
export async function updateCompetition(data: {
  id: string
  name: string
  year: number
  startDate: string
  endDate: string
  description: string
  status: string
}) {
  const session = await auth()
  
  // Check if the user is authenticated and is an admin
  if (!session?.user?.id || session.user.role !== 'admin') {
    throw new Error('Unauthorized: Only admins can update competitions')
  }
  
  try {
    const { id, name, year, startDate, endDate, description, status } = data
    
    // Check if the competition exists
    const existingCompetition = await db.competition.findUnique({
      where: { id }
    })
    
    if (!existingCompetition) {
      throw new Error('Competition not found')
    }
    
    // Check if another competition with the same name+year exists (excluding this one)
    const duplicateCompetition = await db.competition.findFirst({
      where: {
        AND: [
          { name: { equals: name, mode: 'insensitive' } },
          { year: year },
          { NOT: { id: id } }
        ]
      }
    })
    
    if (duplicateCompetition) {
      throw new Error(`Another competition named "${name}" for year ${year} already exists. Please use a unique name.`)
    }
    
    // If trying to set as active, ensure no other competition is active
    if (status === 'active') {
      // Find current active competition
      const activeCompetition = await db.competition.findFirst({
        where: { 
          status: 'active',
          NOT: { id }
        }
      })
      
      // If there's another active competition, set it to inactive
      if (activeCompetition) {
        await db.competition.update({
          where: { id: activeCompetition.id },
          data: { status: 'inactive' }
        })
      }
    }
    
    // Update the competition
    const competition = await db.competition.update({
      where: { id },
      data: {
        name,
        year,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        description,
        status
      }
    })
    
    revalidatePath('/competitions')
    revalidatePath('/dashboard')
    revalidatePath('/admin/competitions')
    revalidatePath(`/competitions/${year}`)
    
    return competition
  } catch (error) {
    console.error('Failed to update competition:', error)
    throw new Error('Failed to update competition')
  }
}

/**
 * Delete a competition by ID
 */
export async function deleteCompetition(id: string) {
  const session = await auth()
  
  // Check if the user is authenticated and is an admin
  if (!session?.user?.id || session.user.role !== 'admin') {
    console.error('Unauthorized attempt to delete competition:', 
      { userId: session?.user?.id, role: session?.user?.role });
    throw new Error('Unauthorized: Only admins can delete competitions')
  }
  
  try {
    // Check if the competition exists
    const competition = await db.competition.findUnique({
      where: { id },
      include: {
        teams: true,
        games: true,
        phases: true,
        eventManagement: true
      }
    })
    
    if (!competition) {
      throw new Error('Competition not found')
    }
    
    // First delete related EventManagement if it exists
    if (competition.eventManagement) {
      // Check if there's a current phase reference we need to nullify first
      if (competition.eventManagement.currentPhaseId) {
        await db.eventManagement.update({
          where: { id: competition.eventManagement.id },
          data: { currentPhaseId: null }
        })
      }
      
      // Now delete the event management record
      await db.eventManagement.delete({
        where: { id: competition.eventManagement.id }
      })
    }
    
    // Delete related phases
    if (competition.phases.length > 0) {
      await db.competitionPhase.deleteMany({
        where: { competitionId: id }
      })
    }
    
    // Delete the competition
    await db.competition.delete({
      where: { id }
    })
    
    // Revalidate paths
    revalidatePath('/competitions')
    revalidatePath('/dashboard')
    revalidatePath('/admin/competitions')
    
    return { success: true }
  } catch (error) {
    console.error('Failed to delete competition:', error)
    
    if (error instanceof Error) {
      throw new Error(`Failed to delete competition: ${error.message}`)
    } else {
      throw new Error('Failed to delete competition: Unknown error occurred')
    }
  }
}

/**
 * Register a user for a competition
 */
export async function registerUserForCompetition(competitionId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in to register for a competition")
  }
  
  try {
    // Check if the competition exists and is open for registration
    const competition = await db.competition.findUnique({
      where: { id: competitionId }
    })
    
    if (!competition) {
      throw new Error("Competition not found")
    }
    
    // Check if the user is already registered for this competition
    const existingRegistration = await db.userCompetition.findUnique({
      where: {
        userId_competitionId: {
          userId: session.user.id,
          competitionId
        }
      }
    })
    
    if (existingRegistration) {
      throw new Error("You are already registered for this competition")
    }
    
    // Register the user for the competition
    const registration = await db.userCompetition.create({
      data: {
        userId: session.user.id,
        competitionId,
        status: "registered"
      }
    })
    
    // Revalidate related paths
    revalidatePath('/competitions')
    revalidatePath('/dashboard')
    
    return { success: true, registration }
  } catch (error) {
    console.error("Failed to register for competition:", error)
    throw new Error(`Failed to register for competition: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Get all competitions a user is registered for
 */
export async function getUserCompetitionRegistrations() {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in to view your registrations")
  }
  
  try {
    // Get all user's registrations with competition details
    const registrations = await db.userCompetition.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        competition: true
      }
    })
    
    return registrations.map(reg => ({
      id: reg.id,
      competitionId: reg.competitionId,
      status: reg.status,
      registeredAt: reg.registeredAt,
      competition: {
        id: reg.competition.id,
        name: reg.competition.name,
        year: reg.competition.year,
        status: reg.competition.status
      }
    }))
  } catch (error) {
    console.error("Failed to fetch user competition registrations:", error)
    throw new Error("Failed to fetch your competition registrations")
  }
}

/**
 * Check if a user is registered for a specific competition
 */
export async function isUserRegisteredForCompetition(competitionId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return false
  }
  
  try {
    const registration = await db.userCompetition.findUnique({
      where: {
        userId_competitionId: {
          userId: session.user.id,
          competitionId
        }
      }
    })
    
    return !!registration
  } catch (error) {
    console.error("Error checking competition registration:", error)
    return false
  }
}

/**
 * Get the count of registered users for a competition
 */
export async function getCompetitionRegisteredUsersCount(competitionId: string) {
  try {
    const count = await db.userCompetition.count({
      where: {
        competitionId,
        status: "registered"
      }
    })
    return count
  } catch (error) {
    console.error('Failed to fetch registered users count:', error)
    return 0
  }
} 