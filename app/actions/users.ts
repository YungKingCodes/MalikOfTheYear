'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { notFound } from 'next/navigation'

/**
 * Get full user profile for the profile page
 */
export async function getUserProfile() {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in to view your profile")
  }
  
  try {
    // Get user with their team and proficiency data
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
      notFound()
    }
    
    // Get active competition
    const activeCompetition = await db.competition.findFirst({
      where: { status: "active" }
    })
    
    // Get user's game participation history
    const gameParticipations = user.team ? await db.gameParticipation.findMany({
      where: { teamId: user.team.id },
      include: {
        game: {
          include: {
            competition: true
          }
        }
      }
    }) : []
    
    // Calculate statistics
    const totalGames = gameParticipations.length
    const completedGames = gameParticipations.filter(p => p.game.status === "completed").length
    const wonGames = gameParticipations.filter(p => p.rank === 1).length
    const winRate = completedGames > 0 ? Math.round((wonGames / completedGames) * 100) : 0
    
    // Group participations by competition for competition history
    const competitionHistory = gameParticipations.reduce((acc, p) => {
      const compId = p.game.competitionId
      if (compId && !acc[compId] && p.game.competition) {
        acc[compId] = {
          id: compId,
          name: p.game.competition.name || "Unknown Competition",
          year: p.game.competition.year || new Date().getFullYear(),
          team: user.team?.name || "Unassigned",
          role: user.id === user.team?.captainId ? "Captain" : "Member",
          status: p.game.competition.status || "unknown"
        }
      }
      return acc
    }, {} as Record<string, any>)
    
    // Convert to array and sort by year descending
    const competitionHistoryArray = Object.values(competitionHistory)
      .sort((a, b) => b.year - a.year)
    
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      teamId: user.teamId,
      team: user.team ? {
        id: user.team.id,
        name: user.team.name,
        score: user.team.score,
        maxScore: user.team.maxScore,
        captainId: user.team.captainId,
        captainName: user.team.captain?.name || "No Captain"
      } : null,
      proficiencyScore: user.proficiencyScore || 0,
      titles: user.titles || [],
      position: user.position || "Member",
      proficiencies: user.proficiencies || [],
      stats: {
        totalGames,
        completedGames,
        wonGames,
        winRate,
        yearsActive: competitionHistoryArray.length
      },
      competitionHistory: competitionHistoryArray,
      aboutMe: "Player with a background in multiple sports. Currently participating in the Malik of The Year competition."
    }
  } catch (error) {
    console.error("Error fetching user profile:", error)
    throw new Error("Failed to fetch user profile")
  }
} 

/**
 * Get user achievements for the PlayerAchievements component
 */
export async function getUserAchievements() {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in to view achievements")
  }
  
  try {
    // Get user with title data
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        titles: true,
        teamId: true,
        team: {
          select: {
            name: true,
            captainId: true
          }
        }
      }
    })
    
    if (!user) {
      notFound()
    }
    
    // Get competition history for the user's team
    const competitions = await db.competition.findMany({
      orderBy: { year: 'desc' },
      take: 3, // Most recent competitions
    })
    
    // Find competitions where user was a captain if applicable
    let isCaptain = false
    if (user.teamId && user.team?.captainId === user.id) {
      isCaptain = true
    }
    
    // Generate achievements based on user data
    const achievements = []
    
    // Add achievements based on titles (which should be stored in the user record)
    if (user.titles) {
      for (const title of user.titles) {
        // This could be enhanced with a lookup to a real "Awards" table in the database
        if (title === "GOAT") {
          achievements.push({
            id: `goat-${user.id}`,
            title: "The GOAT",
            description: "Awarded to the most valuable player of the entire competition. This is the highest honor in the Malik of The Year competition.",
            icon: "Trophy",
            competition: `${new Date().getFullYear()} ${competitions[0]?.name || "Competition"}`,
            date: new Date().toISOString(),
            highlight: true
          })
        } else if (title === "MVP") {
          achievements.push({
            id: `mvp-${user.id}`,
            title: "MVP",
            description: "Awarded to the most valuable player on a team. Recognizes exceptional individual performance.",
            icon: "Medal",
            competition: `${competitions[0]?.year || new Date().getFullYear() - 1} ${competitions[0]?.name || "Competition"}`,
            date: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString(),
          })
        } else if (title === "Rookie") {
          achievements.push({
            id: `rookie-${user.id}`,
            title: "Rookie of the Year",
            description: "Awarded to the best performing first-time participant. Recognizes exceptional talent in new competitors.",
            icon: "Star",
            competition: `${competitions[1]?.year || new Date().getFullYear() - 2} ${competitions[1]?.name || "Competition"}`,
            date: new Date(new Date().setFullYear(new Date().getFullYear() - 2)).toISOString(),
          })
        }
      }
    }
    
    // Add captain achievement if user is a team captain
    if (isCaptain) {
      achievements.push({
        id: `captain-${user.id}`,
        title: "Team Captain",
        description: `Elected by team members to lead the ${user.team?.name || "Team"}. Responsible for team strategy and coordination.`,
        icon: "Crown",
        competition: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        date: new Date(new Date().setMonth(4)).toISOString(), // May 1st of current year
      })
    }
    
    // Add some generic achievements if we don't have enough
    if (achievements.length < 3) {
      achievements.push({
        id: `perfect-${user.id}`,
        title: "Perfect Game",
        description: "Achieved a perfect score in the Basketball Tournament.",
        icon: "Award",
        competition: `${competitions[0]?.year || new Date().getFullYear()} ${competitions[0]?.name || "Competition"}`,
        date: new Date(new Date().setMonth(5)).toISOString(), // June of current year
      })
      
      if (achievements.length < 4) {
        achievements.push({
          id: `spirit-${user.id}`,
          title: "Team Spirit",
          description: "Recognized for exceptional team spirit and motivation.",
          icon: "Award",
          competition: `${competitions[1]?.year || new Date().getFullYear() - 1} ${competitions[1]?.name || "Competition"}`,
          date: new Date(new Date().setFullYear(new Date().getFullYear() - 1, 5, 15)).toISOString(), // June 15 of previous year
        })
      }
    }
    
    return achievements
  } catch (error) {
    console.error("Error fetching user achievements:", error)
    throw new Error("Failed to fetch user achievements")
  }
} 