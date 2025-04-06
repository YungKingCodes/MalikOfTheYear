"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { notFound } from "next/navigation"
import { PrismaClient } from "@prisma/client"

// Add type casting to access Prisma models not recognized by TypeScript
type DbClient = PrismaClient & {
  gameParticipation: any;
}

// Casting db to include gameParticipation model
const prisma = db as DbClient;

/**
 * Gets dashboard statistics for the overview section
 */
export async function getDashboardStats(competitionId?: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in to view dashboard stats")
  }
  
  try {
    // Get the specified competition or the active one if not specified
    let competition;
    
    if (competitionId) {
      competition = await db.competition.findUnique({
        where: { id: competitionId }
      });
    }
    
    // Fallback to active competition if no competition ID was provided or the specified one wasn't found
    if (!competition) {
      competition = await db.competition.findFirst({
        where: { status: "active" }
      });
    }
    
    if (!competition) {
      throw new Error("No competition found")
    }
    
    // Get count of teams
    const teamCount = await db.team.count({
      where: {
        competitionId: competition.id
      }
    })
    
    // Get count of previous competition teams for comparison
    const previousCompetition = await db.competition.findFirst({
      where: { 
        status: "completed",
        year: { lt: competition.year }
      },
      orderBy: { year: 'desc' }
    })
    
    const previousTeamCount = previousCompetition 
      ? await db.team.count({
          where: { 
            competitionId: previousCompetition.id 
          }
        })
      : 0
    
    const teamDifference = teamCount - previousTeamCount
    
    // Get count of registered players
    const playerCount = await db.userCompetition.count({
      where: {
        competitionId: competition.id,
        status: "registered"
      }
    })
    
    // Get previous player count
    const previousPlayerCount = previousCompetition
      ? await db.userCompetition.count({
          where: { 
            competitionId: previousCompetition.id,
            status: "registered"
          }
        })
      : 0
    
    const playerDifference = playerCount - previousPlayerCount
    
    // Get games stats
    const totalGames = await db.game.count({
      where: { competitionId: competition.id }
    })
    
    const completedGames = await db.game.count({
      where: { 
        competitionId: competition.id,
        status: "completed"
      }
    })
    
    const upcomingGames = totalGames - completedGames
    
    // Calculate days remaining if end date exists
    let daysRemaining = null
    if (competition.endDate) {
      const endDate = new Date(competition.endDate)
      const today = new Date()
      const diffTime = endDate.getTime() - today.getTime()
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      daysRemaining = daysRemaining > 0 ? daysRemaining : 0
    }
    
    return {
      teams: {
        count: teamCount,
        difference: teamDifference
      },
      players: {
        count: playerCount,
        difference: playerDifference
      },
      games: {
        total: totalGames,
        completed: completedGames,
        upcoming: upcomingGames
      },
      competition: {
        daysRemaining,
        name: competition.name,
        year: competition.year,
        id: competition.id,
        status: competition.status
      }
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    throw new Error("Failed to fetch dashboard statistics")
  }
}

/**
 * Gets user dashboard profile data
 */
export async function getUserDashboardProfile() {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in to view dashboard profile")
  }
  
  try {
    // Get user with their team
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        team: {
          include: {
            captain: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      }
    })
    
    if (!user) {
      throw new Error("User not found")
    }
    
    // Get active competition
    const activeCompetition = await db.competition.findFirst({
      where: { status: "active" }
    })
    
    if (!activeCompetition) {
      throw new Error("No active competition found")
    }
    
    // Get team rank if user has a team
    let teamRank = null
    if (user.team) {
      const teams = await db.team.findMany({
        orderBy: { score: 'desc' }
      })
      
      teamRank = teams.findIndex(team => team.id === user.team?.id) + 1
    }
    
    // Get user participation stats
    const userStats = await getUserParticipationStats(user.id, activeCompetition.id)
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      score: user.proficiencyScore || 0,
      team: user.team ? {
        id: user.team.id,
        name: user.team.name,
        rank: teamRank,
        score: user.team.score,
        captainId: user.team.captainId,
        isCaptain: user.id === user.team.captainId
      } : null,
      proficiencies: user.proficiencies || [],
      stats: userStats
    }
  } catch (error) {
    console.error("Error fetching user dashboard profile:", error)
    throw new Error("Failed to fetch user dashboard profile")
  }
}

/**
 * Helper function to get user participation stats
 */
async function getUserParticipationStats(userId: string, competitionId: string) {
  try {
    // Get user's team ID
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { teamId: true }
    })
    
    if (!user?.teamId) {
      return {
        gamesTotal: 0,
        gamesPlayed: 0,
        participationRate: 0,
        accolades: []
      }
    }
    
    // Get all games from this competition
    const competitionGames = await db.game.findMany({
      where: { competitionId },
      select: { id: true, status: true }
    })
    
    // Get game IDs from this competition
    const gameIds = competitionGames.map(game => game.id)
    
    // Find game participations for user's team
    const teamParticipations = await db.gameParticipation.findMany({
      where: {
        teamId: user.teamId,
        gameId: { in: gameIds }
      }
    })
    
    // Build a map of game IDs to status
    const gameStatusMap: Record<string, string> = {}
    competitionGames.forEach(game => {
      gameStatusMap[game.id] = game.status
    })
    
    // Calculate participation stats
    const gamesTotal = teamParticipations.length
    const gamesPlayed = teamParticipations.filter(p => 
      gameStatusMap[p.gameId] === "completed"
    ).length
    
    const participationRate = gamesTotal > 0 
      ? Math.round((gamesPlayed / gamesTotal) * 100) 
      : 0
      
    // Mock accolades data for now
    const accolades = [
      "Top Scorer",
      "Team MVP",
      "Most Improved",
      "Perfect Attendance"
    ]
    
    return {
      gamesTotal,
      gamesPlayed,
      participationRate,
      accolades: accolades.slice(0, Math.min(Math.floor(participationRate / 25), 4))
    }
  } catch (error) {
    console.error("Error calculating user participation stats:", error)
    return {
      gamesTotal: 0,
      gamesPlayed: 0,
      participationRate: 0,
      accolades: []
    }
  }
}

/**
 * Get team data for the dashboard overview
 */
export async function getTeamData() {
  const session = await auth()
  const userId = session?.user?.id
  
  // If user is not logged in
  if (!userId) {
    throw new Error("Unauthorized")
  }
  
  try {
    let team = null
    
    // First check if user has a team
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { teamId: true }
    })
    
    // If user belongs to a team, get that team
    if (user?.teamId) {
      team = await db.team.findUnique({
        where: { id: user.teamId },
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
          },
          gameParticipations: {
            include: {
              game: {
                select: {
                  id: true,
                  status: true
                }
              }
            }
          }
        }
      })
    }
    
    // If user doesn't have a team or their team wasn't found, get the first team
    if (!team) {
      team = await db.team.findFirst({
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
          },
          gameParticipations: {
            include: {
              game: {
                select: {
                  id: true,
                  status: true
                }
              }
            }
          }
        }
      })
    }
    
    if (!team) {
      // Return default team data with placeholder values instead of throwing an error
      return {
        id: "no-teams",
        name: "No Teams Available",
        captain: null,
        members: [],
        score: 0,
        maxScore: 100,
        winRate: 0
      }
    }
    
    // Calculate team score and win rate
    const participations = team.gameParticipations || []
    const totalGames = participations.length
    
    // Count completed games where this team ranked 1st (winner)
    const wonGames = participations.filter(p => p.rank === 1).length
    
    // Count completed games
    const completedGames = participations.filter(p => 
      p.game.status === "completed"
    ).length
    
    const winRate = completedGames > 0 ? Math.round((wonGames / completedGames) * 100) : 0
    const teamScore = wonGames * 10 // Assuming each win is 10 points
    const maxPossibleScore = completedGames * 10
    
    return {
      id: team.id,
      name: team.name,
      captain: team.captain,
      members: team.members,
      score: teamScore,
      maxScore: maxPossibleScore > 0 ? maxPossibleScore : 100, // Default max score if no games
      winRate
    }
  } catch (error) {
    console.error("Error fetching team data:", error)
    // Return default team data instead of throwing an error
    return {
      id: "error",
      name: "Team Data Unavailable",
      captain: null,
      members: [],
      score: 0,
      maxScore: 100,
      winRate: 0
    }
  }
}

/**
 * Get competition timeline data
 */
export async function getCompetitionTimeline(competitionId?: string) {
  const session = await auth()
  const userId = session?.user?.id
  
  // If user is not logged in
  if (!userId) {
    throw new Error("Unauthorized")
  }
  
  try {
    // If a specific competition ID is provided, fetch that competition
    // Otherwise, get the active competition or the most recent upcoming one
    let competition = null;
    
    if (competitionId) {
      competition = await db.competition.findUnique({
        where: { id: competitionId },
        include: {
          phases: {
            orderBy: {
              order: 'asc'
            }
          }
        }
      });
    } else {
      // First try to get active competition
      competition = await db.competition.findFirst({
        where: { status: "active" },
        include: {
          phases: {
            orderBy: {
              order: 'asc'
            }
          }
        }
      });
      
      // If no active competition, get the most recent upcoming competition
      if (!competition) {
        competition = await db.competition.findFirst({
          where: { status: "upcoming" },
          orderBy: { startDate: 'asc' },
          include: {
            phases: {
              orderBy: {
                order: 'asc'
              }
            }
          }
        });
      }
      
      // If still no competition, try "inactive" competitions as fallback
      if (!competition) {
        competition = await db.competition.findFirst({
          where: { status: "inactive" },
          orderBy: { startDate: 'asc' },
          include: {
            phases: {
              orderBy: {
                order: 'asc'
              }
            }
          }
        });
      }
    }
    
    if (!competition) {
      // Return empty structure instead of throwing error
      return {
        competitionId: "",
        competitionName: "No Competition Found",
        competitionYear: new Date().getFullYear(),
        phases: [],
        status: "not-found"
      }
    }
    
    // Check if there are phases
    if (!competition.phases || competition.phases.length === 0) {
      // If no phases, create a default timeline with competition start/end
      return {
        competitionId: competition.id,
        competitionName: competition.name,
        competitionYear: competition.year,
        status: competition.status,
        phases: [
          {
            id: "default-phase",
            name: "Competition Period",
            description: "The full competition timeline",
            startDate: competition.startDate.toISOString(),
            endDate: competition.endDate.toISOString(),
            status: getPhaseStatus(competition.startDate, competition.endDate),
            progress: calculateProgress(competition.startDate, competition.endDate),
            order: 1,
            type: "competition"
          }
        ]
      }
    }
    
    // Prepare the timeline data
    const timelinePhases = competition.phases.map(phase => {
      const now = new Date()
      const startDate = new Date(phase.startDate)
      const endDate = new Date(phase.endDate)
      
      // Calculate phase status based on dates
      let phaseStatus = getPhaseStatus(startDate, endDate)
      
      // Calculate progress percentage
      let progress = calculateProgress(startDate, endDate)
      
      return {
        id: phase.id,
        name: phase.name,
        description: phase.description || "",
        startDate: phase.startDate.toISOString(),
        endDate: phase.endDate.toISOString(),
        status: phaseStatus,
        progress,
        order: phase.order,
        type: phase.type
      }
    })
    
    return {
      competitionId: competition.id,
      competitionName: competition.name,
      competitionYear: competition.year,
      status: competition.status,
      phases: timelinePhases
    }
  } catch (error) {
    console.error("Error fetching competition timeline:", error)
    // Return empty structure instead of throwing error
    return {
      competitionId: "",
      competitionName: "Competition Timeline Unavailable",
      competitionYear: new Date().getFullYear(),
      status: "error",
      phases: []
    }
  }
}

// Helper function to calculate phase status based on dates
function getPhaseStatus(startDate: Date, endDate: Date): string {
  const now = new Date();
  
  if (now < startDate) {
    return "inactive";
  } else if (now >= startDate && now <= endDate) {
    return "in-progress";
  } else {
    return "completed";
  }
}

// Helper function to calculate progress percentage
function calculateProgress(startDate: Date, endDate: Date): number {
  const now = new Date();
  
  if (now < startDate) {
    return 0;
  } else if (now > endDate) {
    return 100;
  } else {
    // In progress - calculate percentage
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    return Math.min(Math.floor((elapsed / totalDuration) * 100), 100);
  }
}

/**
 * Get team rankings data for the active competition
 */
export async function getTeamRankings() {
  const session = await auth()
  
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  
  try {
    // Get the active competition
    const activeCompetition = await db.competition.findFirst({
      where: { status: "active" }
    })
    
    if (!activeCompetition) {
      return { teams: [] }
    }
    
    // Get teams for the active competition
    const teams = await db.team.findMany({
      where: { 
        competitionId: activeCompetition.id 
      },
      select: {
        id: true,
        name: true,
        score: true,
        maxScore: true,
        winRate: true,
        captain: {
          select: {
            name: true,
            image: true
          }
        }
      }
    })
    
    // Sort teams by score in descending order
    const rankedTeams = teams
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .map((team, index) => ({
        ...team,
        rank: index + 1,
        captainName: team.captain?.name || "No Captain"
      }))
    
    return {
      teams: rankedTeams
    }
  } catch (error) {
    console.error("Error fetching team rankings:", error)
    throw new Error("Failed to fetch team rankings")
  }
}

/**
 * Get games for the dashboard
 */
export async function getGamesForDashboard() {
  const session = await auth()
  
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  
  try {
    // Get the active competition
    const activeCompetition = await db.competition.findFirst({
      where: { status: "active" }
    })
    
    if (!activeCompetition) {
      return { 
        upcomingGames: [],
        recentGames: []
      }
    }
    
    // Get upcoming games (scheduled but not completed)
    const upcomingGames = await db.game.findMany({
      where: { 
        competitionId: activeCompetition.id,
        status: "scheduled",
        date: {
          gte: new Date()
        }
      },
      orderBy: {
        date: 'asc'
      },
      take: 5,
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
    
    // Get recent games (completed)
    const recentGames = await db.game.findMany({
      where: { 
        competitionId: activeCompetition.id,
        status: "completed",
      },
      orderBy: {
        date: 'desc'
      },
      take: 5,
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
    
    return {
      upcomingGames,
      recentGames
    }
  } catch (error) {
    console.error("Error fetching games for dashboard:", error)
    throw new Error("Failed to fetch games for dashboard")
  }
}

/**
 * Get top players for the dashboard
 */
export async function getPlayerStats(limit = 5) {
  const session = await auth()
  
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  
  try {
    // Get active competition
    const activeCompetition = await db.competition.findFirst({
      where: { status: "active" }
    })
    
    if (!activeCompetition) {
      return []
    }
    
    // Get top players by proficiency score
    const topPlayers = await db.user.findMany({
      where: { 
        role: { in: ["player", "captain"] }
      },
      orderBy: { 
        proficiencyScore: "desc" 
      },
      take: limit,
      select: {
        id: true,
        name: true,
        image: true,
        proficiencyScore: true,
        teamId: true,
        position: true,
        titles: true,
        team: {
          select: { 
            name: true,
            id: true
          }
        }
      }
    })
    
    // Format the response to include team names
    return topPlayers.map(player => ({
      _id: player.id,
      name: player.name,
      teamId: player.teamId,
      team: player.team?.name,
      proficiencyScore: player.proficiencyScore || 0,
      titles: player.titles || [],
      position: player.position || "Member",
      image: player.image
    }))
  } catch (error) {
    console.error("Error fetching player stats:", error)
    return []
  }
} 