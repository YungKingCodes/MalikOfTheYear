'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

/**
 * Updates the team captain
 */
export async function updateTeamCaptain(teamId: string, newCaptainId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in to update team captain")
  }
  
  if (session.user.role !== 'admin') {
    throw new Error("Unauthorized: Only admins can update team captains")
  }
  
  try {
    // Verify team exists
    const team = await db.team.findUnique({
      where: { id: teamId },
      include: {
        members: true
      }
    })
    
    if (!team) {
      throw new Error("Team not found")
    }
    
    // Verify new captain exists and is on the team
    const isMember = team.members.some(member => member.id === newCaptainId)
    if (!isMember) {
      throw new Error("New captain must be a member of the team")
    }
    
    // Update the team with the new captain
    await db.team.update({
      where: { id: teamId },
      data: { captainId: newCaptainId }
    })
    
    // Update the cache
    revalidatePath('/teams')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error("Error updating team captain:", error)
    throw new Error("Failed to update team captain")
  }
}

/**
 * Retrieves teams with members for captain override component
 */
export async function getTeamsForCaptainOverride() {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in to view teams")
  }
  
  if (session.user.role !== 'admin') {
    throw new Error("Unauthorized: Only admins can access this information")
  }
  
  try {
    const teams = await db.team.findMany({
      include: {
        captain: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true
          }
        },
        members: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
            role: true
          }
        }
      }
    })
    
    return teams.map(team => ({
      id: team.id,
      name: team.name,
      score: team.score,
      maxScore: team.maxScore,
      captain: team.captain ? {
        id: team.captain.id,
        name: team.captain.name || "Unknown",
        email: team.captain.email || "",
        image: team.captain.image
      } : null,
      members: team.members.map(member => ({
        id: member.id,
        name: member.name || "Unknown",
        email: member.email || "",
        image: member.image,
        role: member.role
      }))
    }))
  } catch (error) {
    console.error("Error fetching teams for captain override:", error)
    throw new Error("Failed to fetch teams")
  }
}

/**
 * Retrieve all teams with their detailed information
 */
export async function getAllTeams() {
  try {
    // Get current user session
    const session = await auth()
    
    if (!session?.user) {
      throw new Error("Unauthorized: User must be logged in to access teams")
    }

    // Get active competition
    const activeCompetition = await db.competition.findFirst({
      where: { 
        status: "active"
      },
      select: {
        id: true
      }
    })

    if (!activeCompetition) {
      console.log("No active competition found")
      return [] // Return empty array instead of throwing an error
    }

    // Get all teams for active competition with their members and score
    const teams = await db.team.findMany({
      where: {
        competitionId: activeCompetition.id
      },
      select: {
        id: true,
        name: true,
        score: true,
        memberIds: true,
        captainId: true
      },
      orderBy: {
        score: 'desc'
      }
    })
    
    // If no teams exist for this competition, return empty array
    if (!teams.length) {
      console.log("No teams found for the active competition")
      return []
    }

    // Get all members from the teams
    const allMemberIds = teams.flatMap(team => team.memberIds)
    
    // Skip member lookup if there are no members
    let membersMap = new Map()
    if (allMemberIds.length > 0) {
      const members = await db.user.findMany({
        where: {
          id: {
            in: allMemberIds
          }
        },
        select: {
          id: true,
          name: true,
          image: true
        }
      })
      membersMap = new Map(members.map(member => [member.id, member]))
    }

    // Get team captains
    const captainIds = teams.map(team => team.captainId).filter(Boolean)
    let captainsMap = new Map()
    
    // Skip captain lookup if there are no captains
    if (captainIds.length > 0) {
      const captains = await db.user.findMany({
        where: {
          id: {
            in: captainIds as string[]
          }
        },
        select: {
          id: true,
          name: true
        }
      })
      captainsMap = new Map(captains.map(captain => [captain.id, captain.name]))
    }

    // Calculate win rates
    const teamResults = await Promise.all(
      teams.map(async (team) => {
        try {
          // Get team's games
          const games = await db.game.findMany({
            where: {
              competitionId: activeCompetition.id,
              participants: {
                some: {
                  teamId: team.id
                }
              },
              status: "completed"
            },
            select: {
              id: true,
              gameResults: {
                select: {
                  winnerId: true
                }
              },
              participants: {
                select: {
                  teamId: true
                }
              }
            }
          })

          // Calculate win rate
          const completedGames = games.length
          // Check if this team is the winner from gameResults
          const wonGames = games.filter(game => 
            game.gameResults && 
            game.gameResults.some(result => result.winnerId === team.id)
          ).length
          const winRate = completedGames > 0 ? Math.round((wonGames / completedGames) * 100) : 0

          // Map member IDs to member objects
          const teamMembers = team.memberIds.map(id => membersMap.get(id)).filter(Boolean)

          return {
            _id: team.id,
            name: team.name,
            score: team.score || 0,
            maxScore: 1500, // Default max score
            captain: captainsMap.get(team.captainId as string) || "No Captain",
            captainId: team.captainId,
            winRate,
            members: teamMembers || []
          }
        } catch (error) {
          console.error(`Error processing team ${team.id}:`, error)
          // Return basic team info if there's an error processing games
          return {
            _id: team.id,
            name: team.name,
            score: team.score || 0,
            maxScore: 1500,
            captain: captainsMap.get(team.captainId as string) || "No Captain",
            captainId: team.captainId,
            winRate: 0,
            members: team.memberIds.map(id => membersMap.get(id)).filter(Boolean) || []
          }
        }
      })
    )

    return teamResults
  } catch (error) {
    console.error("Error fetching teams:", error)
    throw new Error("Failed to fetch teams data")
  }
}

/**
 * Retrieve teams that are not at full capacity
 */
export async function getIncompleteTeams() {
  try {
    // Get active competition
    const activeCompetition = await db.competition.findFirst({
      where: { 
        status: "active"
      },
      select: {
        id: true,
        settings: true
      }
    })

    if (!activeCompetition) {
      return []
    }

    // Parse competition settings to get max team size
    const settings = activeCompetition.settings ? JSON.parse(activeCompetition.settings as string) : {}
    const maxTeamSize = settings.teamSize || 8 // Default to 8 if not specified

    const teams = await db.team.findMany({
      where: {
        competitionId: activeCompetition.id
      },
      select: {
        id: true,
        name: true,
        score: true,
        memberIds: true,
        captainId: true
      }
    })

    // Get all members from the teams
    const allMemberIds = teams.flatMap(team => team.memberIds)
    const members = await db.user.findMany({
      where: {
        id: {
          in: allMemberIds
        }
      },
      select: {
        id: true,
        name: true,
        image: true
      }
    })

    const membersMap = new Map(members.map(member => [member.id, member]))

    // Get team captains
    const captainIds = teams.map(team => team.captainId).filter(Boolean)
    const captains = await db.user.findMany({
      where: {
        id: {
          in: captainIds as string[]
        }
      },
      select: {
        id: true,
        name: true
      }
    })

    const captainsMap = new Map(captains.map(captain => [captain.id, captain.name]))

    // Filter for incomplete teams
    const incompleteTeams = teams
      .filter(team => team.memberIds.length < maxTeamSize)
      .map(team => {
        // Map member IDs to member objects
        const teamMembers = team.memberIds.map(id => membersMap.get(id)).filter(Boolean)

        return {
          _id: team.id,
          name: team.name,
          score: team.score || 0,
          captain: captainsMap.get(team.captainId as string) || "No Captain",
          captainId: team.captainId,
          members: teamMembers || [],
          neededPlayers: maxTeamSize - team.memberIds.length
        }
      })

    return incompleteTeams
  } catch (error) {
    console.error("Error fetching incomplete teams:", error)
    throw new Error("Failed to fetch incomplete teams data")
  }
}

/**
 * Retrieve teams that are in the captain voting process
 */
export async function getTeamsInCaptainVoting() {
  try {
    // Get active competition
    const activeCompetition = await db.competition.findFirst({
      where: { 
        status: "active"
      },
      select: {
        id: true
      }
    })

    if (!activeCompetition) {
      console.log("No active competition found")
      return []
    }

    try {
      // Get teams in voting process by querying for teams without a captain
      // But with members (real implementation)
      const teamsInVoting = await db.team.findMany({
        where: {
          competitionId: activeCompetition.id,
          captainId: null,
          memberIds: {
            isEmpty: false
          }
        },
        select: {
          id: true,
          name: true,
          memberIds: true
        }
      })
      
      if (teamsInVoting.length === 0) {
        console.log("No teams found in captain voting process")
        return []
      }

      // Get all members from the teams
      const allMemberIds = teamsInVoting.flatMap(team => team.memberIds || [])
      
      if (allMemberIds.length === 0) {
        console.log("No members found in teams")
        return []
      }
      
      const members = await db.user.findMany({
        where: {
          id: {
            in: allMemberIds
          }
        },
        select: {
          id: true,
          name: true,
          image: true
        }
      })

      const membersMap = new Map(members.map(member => [member.id, member]))

      // Return properly formatted team data
      return teamsInVoting.map(team => {
        const totalMembers = team.memberIds?.length || 0
        
        // Map member IDs to member objects
        const teamMembers = (team.memberIds || [])
          .map(id => membersMap.get(id))
          .filter(Boolean)
        
        // For votes cast, get captain votes from the database
        // In this implementation, we're using a simplified approach
        // Count distinct members with the role 'nominated_captain'
        const votedMemberIds = new Set()
        teamMembers.forEach(member => {
          if (member && member.role === 'nominated_captain') {
            votedMemberIds.add(member.id)
          }
        })
        const votesCast = votedMemberIds.size
        
        return {
          _id: team.id,
          name: team.name,
          members: teamMembers,
          votesCast,
          totalMembers,
          status: "in_progress",
          votingPercentage: totalMembers > 0 ? Math.round((votesCast / totalMembers) * 100) : 0
        }
      })
    } catch (dbError) {
      console.error("Database error fetching teams in captain voting:", dbError)
      return []
    }
  } catch (error) {
    console.error("Error fetching teams in captain voting:", error)
    return []
  }
}

/**
 * Creates a new team with optional captain
 */
export async function createTeam(name: string, competitionId: string, captainId?: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in to create a team")
  }
  
  if (session.user.role !== 'admin') {
    throw new Error("Unauthorized: Only admins can create teams")
  }
  
  try {
    // Verify competition exists
    const competition = await db.competition.findUnique({
      where: { id: competitionId }
    })
    
    if (!competition) {
      throw new Error("Competition not found")
    }
    
    // Create team data object
    const teamData: any = {
      name,
      competitionId,
      score: 0,
      memberIds: [] // Start with empty members array
    }
    
    // Add captain if provided
    if (captainId) {
      // Verify captain exists
      const captain = await db.user.findUnique({
        where: { id: captainId }
      })
      
      if (!captain) {
        throw new Error("Captain not found")
      }
      
      teamData.captainId = captainId
      teamData.memberIds.push(captainId) // Add captain to members
    }
    
    // Create the team
    const team = await db.team.create({
      data: teamData
    })
    
    // Update the cache
    revalidatePath('/teams')
    revalidatePath('/admin/teams')
    revalidatePath('/dashboard')
    
    return { success: true, team }
  } catch (error) {
    console.error("Error creating team:", error)
    throw new Error("Failed to create team")
  }
}

/**
 * Add a user to a team
 */
export async function addTeamMember(teamId: string, userId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in to modify teams")
  }
  
  if (session.user.role !== 'admin') {
    throw new Error("Unauthorized: Only admins can add members to teams")
  }
  
  try {
    // Verify team exists
    const team = await db.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
        competition: true
      }
    })
    
    if (!team) {
      throw new Error("Team not found")
    }

    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) {
      throw new Error("User not found")
    }
    
    // Check if user is already on a team in this competition
    if (user.teamId) {
      const userCurrentTeam = await db.team.findUnique({
        where: { id: user.teamId },
        select: { competitionId: true, id: true }
      })
      
      if (userCurrentTeam && userCurrentTeam.competitionId === team.competitionId) {
        // If the user is already on a team in this competition,
        // but it's a different team than the one we're adding to,
        // we'll remove them from their current team first
        if (userCurrentTeam.id !== teamId) {
          // Remove the user from their current team's memberIds
          const currentTeam = await db.team.findUnique({
            where: { id: user.teamId },
            select: { memberIds: true, captainId: true }
          })
          
          if (currentTeam) {
            // If user is the team captain, remove captain
            if (currentTeam.captainId === userId) {
              await db.team.update({
                where: { id: user.teamId },
                data: { captainId: null }
              })
            }
            
            // Update the memberIds array
            await db.team.update({
              where: { id: user.teamId },
              data: {
                memberIds: {
                  set: currentTeam.memberIds.filter(id => id !== userId)
                }
              }
            })
          }
        } else {
          // If they're already on this exact team, just return success
          return { success: true }
        }
      }
    }
    
    // Check if user is already on this team
    if (team.members.some(member => member.id === userId)) {
      return { success: true } // Already on this team, just return success
    }
    
    // Update user's team
    await db.user.update({
      where: { id: userId },
      data: { teamId: teamId }
    })
    
    // Update team's memberIds if the user is not already in the list
    if (!team.memberIds.includes(userId)) {
      await db.team.update({
        where: { id: teamId },
        data: {
          memberIds: {
            push: userId
          }
        }
      })
    }
    
    // Update the cache
    revalidatePath('/teams')
    revalidatePath(`/admin/teams/${teamId}/members`)
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error("Error adding team member:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to add team member")
  }
}

/**
 * Remove a user from a team
 */
export async function removeTeamMember(teamId: string, userId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in to modify teams")
  }
  
  if (session.user.role !== 'admin') {
    throw new Error("Unauthorized: Only admins can remove members from teams")
  }
  
  try {
    // Verify team exists
    const team = await db.team.findUnique({
      where: { id: teamId }
    })
    
    if (!team) {
      throw new Error("Team not found")
    }
    
    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) {
      throw new Error("User not found")
    }
    
    // Check if user is a member of this team
    if (user.teamId !== teamId) {
      throw new Error("User is not a member of this team")
    }
    
    // Check if user is the team captain
    if (team.captainId === userId) {
      // Remove captain from team
      await db.team.update({
        where: { id: teamId },
        data: { captainId: null }
      })
    }
    
    // Update user's team
    await db.user.update({
      where: { id: userId },
      data: { teamId: null }
    })
    
    // Remove user from team's memberIds
    await db.team.update({
      where: { id: teamId },
      data: {
        memberIds: {
          set: team.memberIds.filter(id => id !== userId)
        }
      }
    })
    
    // Update the cache
    revalidatePath('/teams')
    revalidatePath(`/admin/teams/${teamId}/members`)
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error("Error removing team member:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to remove team member")
  }
}

/**
 * Get team details with members
 */
export async function getTeamWithMembers(teamId: string) {
  try {
    // Get team with members data
    const team = await db.team.findUnique({
      where: { id: teamId },
      include: {
        competition: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        captain: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true
          }
        },
        members: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
            role: true
          }
        }
      }
    })
    
    if (!team) {
      throw new Error("Team not found")
    }
    
    return {
      id: team.id,
      name: team.name,
      score: team.score,
      maxScore: team.maxScore,
      competitionId: team.competitionId,
      competition: team.competition ? {
        id: team.competition.id,
        name: team.competition.name,
        status: team.competition.status
      } : null,
      captain: team.captain ? {
        id: team.captain.id,
        name: team.captain.name || "Unknown",
        email: team.captain.email || "",
        image: team.captain.image
      } : null,
      members: team.members.map(member => ({
        id: member.id,
        name: member.name || "Unknown",
        email: member.email || "",
        image: member.image,
        role: member.role
      }))
    }
  } catch (error) {
    console.error("Error fetching team details:", error)
    throw new Error("Failed to fetch team details")
  }
}

/**
 * Update team details
 */
export async function updateTeam(teamId: string, data: { name: string; competitionId?: string }) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in to update a team")
  }
  
  if (session.user.role !== 'admin') {
    throw new Error("Unauthorized: Only admins can update teams")
  }
  
  try {
    // Verify team exists
    const team = await db.team.findUnique({
      where: { id: teamId },
    })
    
    if (!team) {
      throw new Error("Team not found")
    }
    
    // If competition is changing, verify the new competition exists
    if (data.competitionId && data.competitionId !== team.competitionId) {
      const competition = await db.competition.findUnique({
        where: { id: data.competitionId }
      })
      
      if (!competition) {
        throw new Error("Competition not found")
      }
      
      // Check if the team has members and if they're on other teams in the new competition
      if (team.memberIds.length > 0) {
        // Get all teams in the target competition
        const teamsInCompetition = await db.team.findMany({
          where: { 
            competitionId: data.competitionId,
            id: { not: teamId }
          },
          select: { memberIds: true }
        })
        
        // Flatten all member IDs in the competition
        const membersInCompetition = teamsInCompetition.flatMap(t => t.memberIds)
        
        // Check if any of this team's members are already in the target competition
        const conflictingMembers = team.memberIds.filter(id => membersInCompetition.includes(id))
        
        if (conflictingMembers.length > 0) {
          throw new Error(`${conflictingMembers.length} team members are already on teams in the target competition`)
        }
      }
    }
    
    // Update the team
    const updatedTeam = await db.team.update({
      where: { id: teamId },
      data: {
        name: data.name,
        competitionId: data.competitionId
      }
    })
    
    // Update the cache
    revalidatePath('/teams')
    revalidatePath('/admin/teams')
    revalidatePath(`/admin/teams/${teamId}`)
    revalidatePath('/dashboard')
    
    return { success: true, team: updatedTeam }
  } catch (error) {
    console.error("Error updating team:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to update team")
  }
}

export async function createTeams(competitionId: string, numberOfTeams: number) {
  try {
    // Check if teams already exist for this competition
    const existingTeams = await db.team.findMany({
      where: {
        competitionId
      }
    })

    if (existingTeams.length > 0) {
      throw new Error("Teams already exist for this competition")
    }

    // Get the competition
    const competition = await db.competition.findUnique({
      where: {
        id: competitionId
      }
    })

    if (!competition) {
      throw new Error("Competition not found")
    }

    // Get all players in the competition
    const competitionPlayers = await db.competitionPlayer.findMany({
      where: {
        competitionId
      },
      include: {
        user: true
      }
    })

    if (competitionPlayers.length === 0) {
      throw new Error("No players found in this competition")
    }

    // Get player self-scores
    const playerSelfScores = await db.playerSelfScore.findMany({
      where: {
        competitionId
      }
    })

    // Get player ratings
    const playerRatings = await db.playerRating.findMany({
      where: {
        competitionId
      }
    })

    // Calculate player scores based on self-assessment and peer ratings
    const playerScores: Record<string, number> = {}
    
    for (const player of competitionPlayers) {
      const userId = player.userId
      
      // Get self score for this player
      const selfScore = playerSelfScores.find(score => score.userId === userId)
      
      // Get peer ratings for this player
      const peerRatingsForPlayer = playerRatings.filter(rating => rating.ratedId === userId)
      
      // Calculate score
      let finalScore = 0
      
      if (selfScore) {
        // Self-assessment: 60% weight
        const selfScoreValue = (selfScore.technicalScore + selfScore.tacticalScore + 
                              selfScore.physicalScore + selfScore.mentalScore) / 4
        finalScore += selfScoreValue * 0.6
      }
      
      if (peerRatingsForPlayer.length > 0) {
        // Peer ratings: 40% weight
        const avgPeerRating = peerRatingsForPlayer.reduce((sum, rating) => sum + rating.score, 0) / 
                            peerRatingsForPlayer.length
        finalScore += avgPeerRating * 0.4
      }
      
      // If no scores are available, assign a default value
      if (!selfScore && peerRatingsForPlayer.length === 0) {
        finalScore = 50 // Default middle score
      }
      
      playerScores[userId] = Math.round(finalScore)
    }

    // Get captains
    const captainVotes = await db.captainVote.findMany({
      where: {
        competitionId
      },
      select: {
        votedForUserId: true
      }
    })

    // Count votes for each player
    const voteCount: Record<string, number> = {}
    captainVotes.forEach(vote => {
      const userId = vote.votedForUserId
      voteCount[userId] = (voteCount[userId] || 0) + 1
    })

    // Create an array of player IDs with their vote counts and scores
    const playersWithVotesAndScores = competitionPlayers.map(player => ({
      userId: player.userId,
      name: player.user.name || 'Unknown',
      voteCount: voteCount[player.userId] || 0,
      score: playerScores[player.userId] || 50
    }))

    // Sort by vote count (descending) for captain selection
    playersWithVotesAndScores.sort((a, b) => b.voteCount - a.voteCount)

    // Take the top N players as captains
    const captains = playersWithVotesAndScores.slice(0, numberOfTeams)

    // Remove captains from the pool of available players
    const availablePlayers = playersWithVotesAndScores.filter(
      player => !captains.some(captain => captain.userId === player.userId)
    )

    // Sort available players by score (descending)
    availablePlayers.sort((a, b) => b.score - a.score)

    // Prepare team structures
    const teams = captains.map((captain, index) => ({
      id: `team-${index + 1}`, // Temporary ID
      name: `Team ${index + 1}`,
      captainId: captain.userId,
      captainName: captain.name,
      members: [captain],
      totalScore: captain.score,
      averageScore: captain.score
    }))

    // Implement balanced team allocation using player scores
    // Snake draft - first go 0,1,2,...,n then n,...,2,1,0 to ensure balance
    let goingForward = true
    
    while (availablePlayers.length > 0) {
      const teamOrder = goingForward 
        ? Array.from({ length: teams.length }, (_, i) => i) 
        : Array.from({ length: teams.length }, (_, i) => teams.length - 1 - i)
        
      for (const teamIndex of teamOrder) {
        if (availablePlayers.length === 0) break
        
        const team = teams[teamIndex]
        
        // Find the best player to balance the team
        const bestMatchIndex = findBestPlayerForTeamBalance(team, availablePlayers)
        const selectedPlayer = availablePlayers.splice(bestMatchIndex, 1)[0]
        
        // Add player to team
        team.members.push(selectedPlayer)
        team.totalScore += selectedPlayer.score
        team.averageScore = team.totalScore / team.members.length
        
        if (availablePlayers.length === 0) break
      }
      
      // Reverse direction for snake draft
      goingForward = !goingForward
    }

    // Create teams in the database
    const createdTeams = []
    
    for (const team of teams) {
      const memberIds = team.members.map(member => member.userId)
      
      const createdTeam = await db.team.create({
        data: {
          name: team.name,
          competitionId,
          captainId: team.captainId,
          memberIds,
          score: Math.round(team.averageScore),
          maxScore: 100 // Default max score
        }
      })
      
      createdTeams.push(createdTeam)
    }

    return createdTeams
  } catch (error) {
    console.error("Error creating teams:", error)
    throw error
  }
}

// Helper function to find the best player to add to a team for balancing
function findBestPlayerForTeamBalance(team: any, availablePlayers: any[]) {
  // Calculate the current average score of the team
  const currentAvg = team.averageScore
  
  // Find the player whose score is closest to the target score
  // The target is a player who would bring the team average closest to the middle value (50)
  // This helps create balanced teams
  const targetScore = 50
  
  // Calculate which player would bring the team closest to the target score
  let bestMatchIndex = 0
  let bestMatchDifference = Math.abs((team.totalScore + availablePlayers[0].score) / (team.members.length + 1) - targetScore)
  
  for (let i = 1; i < availablePlayers.length; i++) {
    const player = availablePlayers[i]
    const newAverage = (team.totalScore + player.score) / (team.members.length + 1)
    const difference = Math.abs(newAverage - targetScore)
    
    if (difference < bestMatchDifference) {
      bestMatchDifference = difference
      bestMatchIndex = i
    }
  }
  
  return bestMatchIndex
} 