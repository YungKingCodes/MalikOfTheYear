'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { notFound } from "next/navigation"

// Game validation schema
const GameSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Game name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.string().min(1, "Game type is required"),
  playerCount: z.coerce.number().int().min(1, "Player count must be at least 1"),
  duration: z.coerce.number().int().min(5, "Duration must be at least 5 minutes"),
  status: z.string().default("available"),
  category: z.string().min(1, "Category is required"),
  competitionId: z.string().optional(),
  date: z.string().optional(),
  location: z.string().optional(),
  pointsValue: z.coerce.number().int().nonnegative().default(10),
  backupPlan: z.string().optional(),
  difficulty: z.string().default("Medium"),
  winCondition: z.string().default("Score"),
  materialsNeeded: z.string().optional(),
  cost: z.coerce.number().nonnegative().optional(),
})

export type GameFormValues = z.infer<typeof GameSchema>

/**
 * Get all games (with optional filters)
 */
export async function getGames() {
  try {
    return await db.game.findMany({
      orderBy: {
        createdAt: 'desc'
      },
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
        },
        competition: {
          select: {
            id: true,
            name: true,
            year: true
          }
        }
      }
    })
  } catch (error) {
    console.error("Failed to fetch games:", error)
    return []
  }
}

/**
 * Get suggested games
 */
export async function getSuggestedGames() {
  const session = await auth()
  const userId = session?.user?.id

  try {
    const suggestedGames = await db.suggestedGame.findMany({
      orderBy: {
        votes: 'desc'
      },
      include: {
        suggestedBy: {
          select: {
            id: true,
            name: true
          }
        },
        userVotes: userId ? {
          where: { userId },
          select: { id: true }
        } : undefined
      }
    })

    return suggestedGames.map(game => ({
      ...game,
      hasVoted: game.userVotes && game.userVotes.length > 0
    }))
  } catch (error) {
    console.error("Failed to fetch suggested games:", error)
    return []
  }
}

/**
 * Get a single game by ID
 */
export async function getGameById(id: string) {
  try {
    const game = await db.game.findUnique({
      where: { id },
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
        },
        competition: {
          select: {
            id: true,
            name: true,
            year: true
          }
        }
      }
    })

    if (!game) {
      notFound()
    }

    return game
  } catch (error) {
    console.error("Failed to fetch game details:", error)
    throw new Error("Failed to fetch game details")
  }
}

/**
 * Create a new game
 */
export async function createGame(data: GameFormValues) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized: Only admins can create games')
  }

  try {
    // Validate the data
    const validatedData = GameSchema.parse(data)
    
    // Create the game
    const game = await db.game.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        type: validatedData.type,
        playerCount: validatedData.playerCount,
        duration: validatedData.duration,
        status: validatedData.status,
        category: validatedData.category,
        date: validatedData.date ? new Date(validatedData.date) : undefined,
        location: validatedData.location,
        pointsValue: validatedData.pointsValue,
        backupPlan: validatedData.backupPlan,
        competitionId: validatedData.competitionId,
        difficulty: validatedData.difficulty || "Medium",
        winCondition: validatedData.winCondition || "Score",
        materialsNeeded: validatedData.materialsNeeded,
        cost: validatedData.cost
      }
    })

    revalidatePath('/games')
    return game
  } catch (error) {
    console.error('Error creating game:', error)
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.errors.map(e => e.message).join(", ")}`)
    }
    throw new Error('Failed to create game')
  }
}

/**
 * Update an existing game
 */
export async function updateGame(id: string, data: GameFormValues) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized: Only admins can update games')
  }

  try {
    console.log("Original update data received:", JSON.stringify(data, null, 2))
    
    // Process the data to handle empty string vs undefined correctly
    const processedData = {
      ...data,
      competitionId: data.competitionId === "" || data.competitionId === "none" ? undefined : data.competitionId
    }
    
    // Validate the data
    const validatedData = GameSchema.parse(processedData)
    
    console.log("Updating game with ID:", id, "and validated data:", JSON.stringify(validatedData, null, 2))
    
    // Update the game - explicitly set competitionId to null when undefined
    const game = await db.game.update({
      where: { id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        type: validatedData.type,
        playerCount: validatedData.playerCount,
        duration: validatedData.duration,
        status: validatedData.status,
        category: validatedData.category,
        date: validatedData.date ? new Date(validatedData.date) : null,
        location: validatedData.location || null,
        pointsValue: validatedData.pointsValue,
        backupPlan: validatedData.backupPlan || null,
        // Explicitly set to null when undefined
        competitionId: validatedData.competitionId === undefined ? null : validatedData.competitionId,
        difficulty: validatedData.difficulty || "Medium",
        winCondition: validatedData.winCondition || "Score",
        materialsNeeded: validatedData.materialsNeeded || null,
        cost: validatedData.cost || null
      }
    })

    console.log("Game updated successfully, result:", JSON.stringify({
      id: game.id,
      name: game.name,
      competitionId: game.competitionId
    }, null, 2))
    
    // Revalidate all relevant paths
    revalidatePath('/games')
    revalidatePath(`/games/${id}`)
    revalidatePath('/admin/games')
    revalidatePath(`/admin/games/${id}`)
    revalidatePath('/api/games')
    
    return game
  } catch (error) {
    console.error('Error updating game:', error)
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.errors.map(e => e.message).join(", ")}`)
    }
    throw new Error('Failed to update game')
  }
}

/**
 * Delete a game
 */
export async function deleteGame(id: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized: Only admins can delete games')
  }

  try {
    await db.game.delete({
      where: { id }
    })

    revalidatePath('/games')
    return { success: true }
  } catch (error) {
    console.error('Error deleting game:', error)
    throw new Error('Failed to delete game')
  }
}

/**
 * Suggest a new game
 */
export async function suggestGame(name: string, description: string, type: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized: You must be logged in to suggest games')
  }

  const userId = session.user.id

  try {
    // First check if a suggestion with this name already exists
    const existingSuggestion = await db.suggestedGame.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    })

    if (existingSuggestion) {
      throw new Error('A game with this name has already been suggested')
    }

    // Check if this name already exists in the regular games
    const existingGame = await db.game.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    })

    if (existingGame) {
      throw new Error('A game with this name already exists in the game pool')
    }

    // Create the suggested game
    const suggestedGame = await db.suggestedGame.create({
      data: {
        name,
        description,
        type,
        suggestedById: userId,
        votes: 1, // Start with 1 vote (from the suggester)
        userVotes: {
          create: {
            userId
          }
        }
      }
    })

    revalidatePath('/games')
    return suggestedGame
  } catch (error) {
    console.error('Error suggesting game:', error)
    throw new Error('Failed to suggest game: ' + (error as Error).message)
  }
}

/**
 * Vote for a suggested game
 */
export async function voteForSuggestedGame(id: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in to vote")
  }

  const userId = session.user.id
  
  try {
    // Check if the user has already voted
    const existingVote = await db.suggestedGameVote.findFirst({
      where: {
        suggestedGameId: id,
        userId
      }
    })

    if (existingVote) {
      throw new Error("You have already voted for this game")
    }

    // Add a vote
    await db.suggestedGameVote.create({
      data: {
        suggestedGameId: id,
        userId
      }
    })

    // Update the vote count on the suggested game
    await db.suggestedGame.update({
      where: { id },
      data: {
        votes: {
          increment: 1
        }
      }
    })

    return { success: true, message: "Vote recorded successfully" }
  } catch (error) {
    console.error("Error voting for game:", error)
    throw new Error(error instanceof Error ? error.message : "Error voting for game")
  }
}

/**
 * Approve a suggested game and convert it to a regular game
 */
export async function approveGame(suggestedGameId: string) {
  const session = await auth()
  
  if (!session?.user?.id || session.user.role !== 'admin') {
    throw new Error("Unauthorized: Only admins can approve games")
  }
  
  try {
    // Get the suggested game
    const suggestedGame = await db.suggestedGame.findUnique({
      where: { id: suggestedGameId }
    })

    if (!suggestedGame) {
      throw new Error("Suggested game not found")
    }

    // Create a new game from the suggested game with all relevant fields
    const game = await db.game.create({
      data: {
        name: suggestedGame.name,
        description: suggestedGame.description,
        type: suggestedGame.type,
        category: suggestedGame.category,
        playerCount: suggestedGame.playerCount,
        duration: suggestedGame.duration,
        backupPlan: suggestedGame.backupPlan,
        difficulty: suggestedGame.difficulty,
        winCondition: suggestedGame.winCondition,
        materialsNeeded: suggestedGame.materialsNeeded,
        cost: suggestedGame.cost,
        status: "available",
        pointsValue: 10
      }
    })

    // Delete the suggested game
    await db.suggestedGame.delete({
      where: { id: suggestedGameId }
    })

    revalidatePath('/games')
    return { success: true, game }
  } catch (error) {
    console.error("Error approving game:", error)
    throw new Error("Failed to approve game")
  }
}

/**
 * Add a game to a competition
 */
export async function addGameToCompetition(gameId: string, competitionId: string, date?: string, location?: string, pointsValue?: number) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized: Only admins can add games to competitions')
  }

  try {
    const game = await db.game.update({
      where: { id: gameId },
      data: {
        competitionId,
        status: 'scheduled',
        date: date ? new Date(date) : undefined,
        location,
        pointsValue: pointsValue || 10
      }
    })

    revalidatePath('/games')
    revalidatePath(`/games/${gameId}`)
    return game
  } catch (error) {
    console.error('Error adding game to competition:', error)
    throw new Error('Failed to add game to competition')
  }
}

/**
 * Create a new suggested game
 */
export async function createSuggestedGame(data: {
  name: string
  description: string
  type: string
  category: string
  playerCount: number
  duration: number
  backupPlan?: string
  difficulty: string
  winCondition: string
  materialsNeeded?: string
  cost?: number
}) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in to suggest a game")
  }

  const userId = session.user.id
  
  try {
    // Check if a game with this name already exists in suggestions or regular games
    const [existingSuggestion, existingGame] = await Promise.all([
      db.suggestedGame.findFirst({
        where: { name: { equals: data.name, mode: 'insensitive' } }
      }),
      db.game.findFirst({
        where: { name: { equals: data.name, mode: 'insensitive' } }
      })
    ]);

    if (existingSuggestion) {
      throw new Error("A game with this name has already been suggested");
    }

    if (existingGame) {
      throw new Error("A game with this name already exists in the game pool");
    }
    
    // Create the suggested game
    const suggestedGame = await db.suggestedGame.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        category: data.category || "Other",
        playerCount: data.playerCount || 0,
        duration: data.duration || 30,
        backupPlan: data.backupPlan,
        difficulty: data.difficulty || "Medium",
        winCondition: data.winCondition || "Score",
        materialsNeeded: data.materialsNeeded,
        cost: data.cost,
        suggestedById: userId,
        votes: 1 // Start with 1 vote (the creator's vote)
      }
    })

    // Add a vote from the creator
    await db.suggestedGameVote.create({
      data: {
        suggestedGameId: suggestedGame.id,
        userId
      }
    })

    revalidatePath('/games')
    return suggestedGame
  } catch (error) {
    console.error("Error suggesting game:", error)
    throw new Error("Failed to suggest game")
  }
}

/**
 * Vote for a game
 */
export async function voteForGame(suggestedGameId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in to vote")
  }

  const userId = session.user.id
  
  try {
    // Check if the user has already voted
    const existingVote = await db.suggestedGameVote.findFirst({
      where: {
        suggestedGameId,
        userId
      }
    })

    if (existingVote) {
      // Remove vote
      await db.suggestedGameVote.delete({
        where: {
          id: existingVote.id
        }
      })

      // Decrement vote count
      await db.suggestedGame.update({
        where: {
          id: suggestedGameId
        },
        data: {
          votes: {
            decrement: 1
          }
        }
      })

      revalidatePath('/games')
      return { success: true, message: "Vote removed", action: "removed" }
    } else {
      // Add vote
      await db.suggestedGameVote.create({
        data: {
          suggestedGameId,
          userId
        }
      })

      // Increment vote count
      await db.suggestedGame.update({
        where: {
          id: suggestedGameId
        },
        data: {
          votes: {
            increment: 1
          }
        }
      })

      revalidatePath('/games')
      return { success: true, message: "Vote added", action: "added" }
    }
  } catch (error) {
    console.error("Error voting for game:", error)
    throw new Error("Failed to vote for game")
  }
}

/**
 * Update game status
 */
export async function updateGameStatus(gameId: string, status: string) {
  const session = await auth()
  const userId = session?.user?.id
  const userRole = session?.user?.role
  
  if (!userId || userRole !== "admin") {
    throw new Error("You must be an admin to update game status")
  }

  try {
    await db.game.update({
      where: { id: gameId },
      data: { status }
    })

    revalidatePath("/games")
    return { success: true }
  } catch (error) {
    console.error("Failed to update game status:", error)
    throw new Error("Failed to update game status")
  }
}

/**
 * Get game details with players for review
 */
export async function getGameDetailsForReview(gameId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }
  
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { 
      role: true,
      teamId: true
    }
  })
  
  // Only team captains can review games
  if (user?.role !== "captain") {
    throw new Error("Only team captains can review games")
  }
  
  try {
    // Get game with details
    const game = await db.game.findUnique({
      where: { id: gameId },
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
    })
    
    if (!game) {
      throw new Error("Game not found")
    }
    
    // Find captain's team in participants
    const captainTeamParticipation = game.participants.find(p => p.teamId === user.teamId)
    
    if (!captainTeamParticipation) {
      throw new Error("You can only review games your team participated in")
    }
    
    // Get team members
    const teamMembers = await db.user.findMany({
      where: { 
        teamId: user.teamId,
        id: { not: session.user.id } // Exclude the captain
      },
      select: {
        id: true,
        name: true,
        image: true,
        // Include any player feedback for this game
        // In a real app, you would fetch this from a GameReview table
      }
    })
    
    // Map to the expected format
    const playerData = teamMembers.map(member => ({
      id: member.id,
      name: member.name || "Team Member",
      avatar: member.image ? member.image : (member.name?.substring(0, 2) || "TM"),
      feedback: null // In a real app, would get feedback if it exists
    }))
    
    // Get opponent team info
    const opponentParticipation = game.participants.find(p => p.teamId !== user.teamId)
    
    // Format game details
    const gameDetails = {
      id: game.id,
      name: game.name,
      date: game.date?.toISOString() || new Date().toISOString(),
      location: game.location || "Main Arena",
      type: game.type,
      status: game.status,
      result: opponentParticipation ? {
        team1Score: captainTeamParticipation.score || 0,
        team2Score: opponentParticipation.score || 0,
        winner: (captainTeamParticipation.score || 0) > (opponentParticipation.score || 0) 
          ? captainTeamParticipation.teamId 
          : opponentParticipation.teamId
      } : undefined
    }
    
    return {
      game: gameDetails,
      players: playerData
    }
  } catch (error) {
    console.error("Failed to fetch game details for review:", error)
    throw new Error("Failed to fetch game details")
  }
}

/**
 * Assign a game to a competition
 */
export async function assignGameToCompetition(gameId: string, competitionId: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized: Only admins can assign games to competitions')
  }

  try {
    // Verify the game and competition exist
    const [game, competition] = await Promise.all([
      db.game.findUnique({ where: { id: gameId } }),
      db.competition.findUnique({ where: { id: competitionId } })
    ])

    if (!game) {
      throw new Error('Game not found')
    }

    if (!competition) {
      throw new Error('Competition not found')
    }

    // Update the game to associate it with the competition
    const updatedGame = await db.game.update({
      where: { id: gameId },
      data: { 
        competitionId,
        status: 'scheduled' // Change status to scheduled when assigned to a competition
      }
    })

    // Update the competition's gameIds array if it doesn't already include this game
    if (!competition.gameIds.includes(gameId)) {
      await db.competition.update({
        where: { id: competitionId },
        data: {
          gameIds: {
            push: gameId
          }
        }
      })
    }

    revalidatePath('/games')
    revalidatePath('/admin/games')
    revalidatePath(`/games/${gameId}`)
    revalidatePath(`/competitions/${competitionId}`)
    return updatedGame
  } catch (error) {
    console.error('Error assigning game to competition:', error)
    throw new Error('Failed to assign game to competition')
  }
}

/**
 * Team captain assigns players to a game
 */
export async function assignTeamToGame(gameId: string, teamId: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized: You must be logged in')
  }

  // Verify user is either an admin or the captain of the team
  const isAdmin = session.user.role === 'admin'
  const isCaptain = session.user.role === 'captain' && session.user.teamId === teamId

  if (!isAdmin && !isCaptain) {
    throw new Error('Unauthorized: Only admins or team captains can assign teams to games')
  }

  try {
    // Check if the game and team exist
    const [game, team] = await Promise.all([
      db.game.findUnique({ 
        where: { id: gameId },
        include: { 
          participants: true 
        }
      }),
      db.team.findUnique({ 
        where: { id: teamId },
        include: { competition: true }
      })
    ])

    if (!game) {
      throw new Error('Game not found')
    }

    if (!team) {
      throw new Error('Team not found')
    }

    // Verify the game belongs to the same competition as the team
    if (game.competitionId !== team.competitionId) {
      throw new Error('Game and team must belong to the same competition')
    }

    // Check if the team is already registered for this game
    const existingParticipation = await db.gameParticipation.findUnique({
      where: {
        gameId_teamId: {
          gameId,
          teamId,
        },
      },
    })

    if (existingParticipation) {
      throw new Error('Team is already registered for this game')
    }

    // Check if the game has reached its maximum number of teams
    if (game.maxTeams && game.participants.length >= game.maxTeams) {
      throw new Error(`Maximum number of teams (${game.maxTeams}) has been reached for this game`)
    }

    // Create the game participation record
    const participation = await db.gameParticipation.create({
      data: {
        gameId,
        teamId,
        status: 'registered'
      }
    })

    revalidatePath('/games')
    revalidatePath(`/games/${gameId}`)
    revalidatePath('/dashboard')
    return participation
  } catch (error) {
    console.error('Error assigning team to game:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to assign team to game')
  }
}

/**
 * Remove a team from a game
 */
export async function removeTeamFromGame(gameId: string, teamId: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized: You must be logged in')
  }

  // Verify user is either an admin or the captain of the team
  const isAdmin = session.user.role === 'admin'
  const isCaptain = session.user.role === 'captain' && session.user.teamId === teamId

  if (!isAdmin && !isCaptain) {
    throw new Error('Unauthorized: Only admins or team captains can remove teams from games')
  }

  try {
    // Delete the game participation record
    await db.gameParticipation.delete({
      where: {
        gameId_teamId: {
          gameId,
          teamId,
        },
      },
    })

    revalidatePath('/games')
    revalidatePath(`/games/${gameId}`)
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Error removing team from game:', error)
    throw new Error('Failed to remove team from game')
  }
}

/**
 * Team captain assigns individual players to a game
 */
export async function assignPlayersToGame(gameId: string, playerIds: string[]) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized: You must be logged in')
  }

  // Verify user is a team captain
  const isCaptain = session.user.role === 'captain'
  const isAdmin = session.user.role === 'admin'

  if (!isCaptain && !isAdmin) {
    throw new Error('Unauthorized: Only team captains or admins can assign players to games')
  }

  try {
    // Check if the game exists
    const game = await db.game.findUnique({ 
      where: { id: gameId },
      include: { 
        participants: {
          include: {
            team: true
          }
        }
      }
    })

    if (!game) {
      throw new Error('Game not found')
    }

    // If user is a captain, verify they are captain of a team that's participating in this game
    if (isCaptain && !isAdmin) {
      const teamId = session.user.teamId
      
      if (!teamId) {
        throw new Error('You must be assigned to a team to manage players')
      }
      
      const isTeamParticipating = game.participants.some(p => p.teamId === teamId)
      
      if (!isTeamParticipating) {
        throw new Error('Your team is not participating in this game')
      }
      
      // Verify all players belong to captain's team
      const playersOnTeam = await db.user.findMany({
        where: {
          id: { in: playerIds },
          teamId: teamId
        }
      })
      
      if (playersOnTeam.length !== playerIds.length) {
        throw new Error('All selected players must belong to your team')
      }
      
      // Check if player count doesn't exceed game requirements
      if (game.playerCount && playerIds.length > game.playerCount) {
        throw new Error(`You cannot assign more than ${game.playerCount} players to this game`)
      }
    }
    
    // Store the players in the game's metadata
    // First get the existing metadata
    const gameWithMetadata = await db.game.findUnique({
      where: { id: gameId },
      select: { metadata: true }
    })
    
    // Parse existing metadata or create new object
    const metadata = gameWithMetadata?.metadata ? 
      JSON.parse(gameWithMetadata.metadata as string) : 
      {}
    
    // Store the player assignments
    // If captain, only update their own team's players
    if (isCaptain && !isAdmin) {
      const teamId = session.user.teamId as string
      
      // Initialize team players array if it doesn't exist
      if (!metadata.teamPlayers) {
        metadata.teamPlayers = {}
      }
      
      // Add or update this team's player assignments
      metadata.teamPlayers[teamId] = playerIds
    } 
    // If admin, replace all player assignments
    else if (isAdmin) {
      // Create or update the first team listed
      const teamId = game.participants[0]?.teamId
      
      if (!teamId) {
        throw new Error('No team is participating in this game yet')
      }
      
      if (!metadata.teamPlayers) {
        metadata.teamPlayers = {}
      }
      
      metadata.teamPlayers[teamId] = playerIds
    }
    
    // Update the game with the new metadata
    await db.game.update({
      where: { id: gameId },
      data: { 
        metadata: JSON.stringify(metadata)
      }
    })
    
    revalidatePath('/games')
    revalidatePath(`/games/${gameId}`)
    return { success: true }
  } catch (error) {
    console.error('Error assigning players to game:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to assign players to game')
  }
}

/**
 * Get assigned players for a game
 */
export async function getGamePlayers(gameId: string) {
  try {
    // Get the game with metadata
    const game = await db.game.findUnique({
      where: { id: gameId },
      select: { 
        metadata: true,
        participants: {
          include: {
            team: true
          }
        }
      }
    })
    
    if (!game) {
      throw new Error('Game not found')
    }
    
    // Parse metadata
    const metadata = game.metadata ? JSON.parse(game.metadata as string) : {}
    
    // Get team players
    const teamPlayers = metadata.teamPlayers || {}
    
    // If no player assignments yet, return empty
    if (Object.keys(teamPlayers).length === 0) {
      return { 
        teams: game.participants.map(p => ({
          teamId: p.teamId,
          teamName: p.team.name,
          players: []
        }))
      }
    }
    
    // Get all player details
    const allPlayerIds = Object.values(teamPlayers).flat() as string[]
    const players = await db.user.findMany({
      where: {
        id: { in: allPlayerIds }
      },
      select: {
        id: true,
        name: true,
        image: true,
        teamId: true
      }
    })
    
    // Create a map for quick lookups
    const playerMap = new Map(players.map(p => [p.id, p]))
    
    // Format response
    const result = {
      teams: game.participants.map(p => {
        const teamId = p.teamId
        const playerIds = teamPlayers[teamId] || []
        
        return {
          teamId,
          teamName: p.team.name,
          players: playerIds.map(id => playerMap.get(id)).filter(Boolean)
        }
      })
    }
    
    return result
  } catch (error) {
    console.error('Error getting game players:', error)
    throw new Error('Failed to get game players')
  }
} 