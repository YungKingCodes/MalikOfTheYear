// This file contains functions to fetch data from the API

// Fetch teams
export async function getTeams(competitionId?: string) {
  const params = new URLSearchParams()
  if (competitionId) {
    params.append("competitionId", competitionId)
  }

  const response = await fetch(`/api/teams?${params.toString()}`)
  if (!response.ok) {
    throw new Error("Failed to fetch teams")
  }

  return response.json()
}

// Fetch team by ID
export async function getTeamById(teamId: string) {
  const response = await fetch(`/api/teams/${teamId}`)
  if (!response.ok) {
    throw new Error("Failed to fetch team")
  }

  return response.json()
}

// Fetch users
export async function getUsers(options?: { teamId?: string; role?: string }) {
  const params = new URLSearchParams()
  if (options?.teamId) {
    params.append("teamId", options.teamId)
  }
  if (options?.role) {
    params.append("role", options.role)
  }

  const response = await fetch(`/api/users?${params.toString()}`)
  if (!response.ok) {
    throw new Error("Failed to fetch users")
  }

  return response.json()
}

// Fetch user by ID
export async function getUserById(userId: string) {
  const response = await fetch(`/api/users/${userId}`)
  if (!response.ok) {
    throw new Error("Failed to fetch user")
  }

  return response.json()
}

// Fetch competitions
export async function getCompetitions(options?: { status?: string; year?: number }) {
  const params = new URLSearchParams()
  if (options?.status) {
    params.append("status", options.status)
  }
  if (options?.year) {
    params.append("year", options.year.toString())
  }

  const response = await fetch(`/api/competitions?${params.toString()}`)
  if (!response.ok) {
    throw new Error("Failed to fetch competitions")
  }

  return response.json()
}

// Fetch games
export async function getGames(options?: {
  competitionId?: string
  status?: string
  teamId?: string
}) {
  const params = new URLSearchParams()
  if (options?.competitionId) {
    params.append("competitionId", options.competitionId)
  }
  if (options?.status) {
    params.append("status", options.status)
  }
  if (options?.teamId) {
    params.append("teamId", options.teamId)
  }

  const response = await fetch(`/api/games?${params.toString()}`)
  if (!response.ok) {
    throw new Error("Failed to fetch games")
  }

  return response.json()
}

// Get active competition
export async function getActiveCompetition() {
  const competitions = await getCompetitions({ status: "active" })
  return competitions[0] || null
}

// Get recent games
export async function getRecentGames(limit = 4) {
  const activeCompetition = await getActiveCompetition()
  if (!activeCompetition) return []

  const games = await getGames({ competitionId: activeCompetition._id })

  // Sort by date (most recent first) and take the limit
  return games.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit)
}

// Get top players
export async function getTopPlayers(limit = 5) {
  const users = await getUsers()

  // Sort by proficiency score (highest first) and take the limit
  return users.sort((a: any, b: any) => b.proficiencyScore - a.proficiencyScore).slice(0, limit)
}

// Get suggested games
export async function getSuggestedGames() {
  try {
    const response = await fetch("/api/games/suggested")
    if (!response.ok) {
      throw new Error(`Failed to fetch suggested games: ${response.status}`)
    }
    return response.json()
  } catch (error) {
    console.error("Error fetching suggested games:", error)
    // Return an empty array instead of throwing an error
    return []
  }
}

// Get team captains
export async function getTeamCaptains() {
  try {
    return getUsers({ role: "captain" })
  } catch (error) {
    console.error("Error fetching team captains:", error)
    return []
  }
}

// Get unassigned players
export async function getUnassignedPlayers() {
  try {
    // In a real implementation, we would have a dedicated endpoint
    // For now, we'll filter the results client-side
    const users = await getUsers()
    return users.filter((user: any) => !user.teamId)
  } catch (error) {
    console.error("Error fetching unassigned players:", error)
    return []
  }
}

// Get titled players
export async function getTitledPlayers() {
  try {
    // In a real implementation, we would have a dedicated endpoint
    // For now, we'll filter the results client-side
    const users = await getUsers()
    return users.filter((user: any) => user.titles && user.titles.length > 0)
  } catch (error) {
    console.error("Error fetching titled players:", error)
    return []
  }
}

// Get teams in captain voting process
export async function getTeamsInCaptainVoting() {
  try {
    const response = await fetch("/api/teams/captain-voting")
    if (!response.ok) {
      throw new Error("Failed to fetch teams in captain voting")
    }
    return response.json()
  } catch (error) {
    console.error("Error fetching teams in captain voting:", error)
    return []
  }
}

// Get incomplete teams
export async function getIncompleteTeams() {
  try {
    // In a real implementation, we would have a dedicated endpoint
    // For now, we'll filter the results client-side
    const teams = await getTeams()
    return teams.filter((team: any) => team.members.length < 8)
  } catch (error) {
    console.error("Error fetching incomplete teams:", error)
    return []
  }
}

// Get game details
export async function getGameDetails(id: string) {
  const response = await fetch(`/api/games/${id}`)
  if (!response.ok) {
    throw new Error("Failed to fetch game details")
  }

  return response.json()
}

// Get team name by ID
export async function getTeamName(teamId: string) {
  try {
    const team = await getTeamById(teamId)
    return team.name
  } catch (error) {
    return teamId
  }
}

// Get player assignments for a game
export async function getPlayerAssignments(gameId: string) {
  const response = await fetch(`/api/games/${gameId}/assignments`)
  if (!response.ok) {
    throw new Error("Failed to fetch player assignments")
  }

  return response.json()
}

// Get upcoming games that need player assignments
export async function getUpcomingGamesNeedingAssignments(teamId: string) {
  const params = new URLSearchParams()
  params.append("teamId", teamId)
  params.append("status", "scheduled")
  params.append("needsAssignments", "true")

  const response = await fetch(`/api/games?${params.toString()}`)
  if (!response.ok) {
    throw new Error("Failed to fetch upcoming games needing assignments")
  }

  return response.json()
}

