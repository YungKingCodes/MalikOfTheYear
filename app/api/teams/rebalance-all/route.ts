import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function POST(request: Request) {
  try {
    // Check authorization
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can rebalance teams" }, { status: 403 })
    }
    
    // Get request data
    const data = await request.json()
    
    if (!data) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 })
    }
    
    const { competitionId } = data
    
    if (!competitionId) {
      return NextResponse.json({ error: "Competition ID is required" }, { status: 400 })
    }
    
    // Verify competition exists
    const competition = await db.competition.findUnique({
      where: { id: competitionId }
    })
    
    if (!competition) {
      return NextResponse.json({ error: "Competition not found" }, { status: 404 })
    }
    
    // Get all teams for the competition
    const teams = await db.team.findMany({
      where: { competitionId },
      include: {
        members: true
      }
    })
    
    if (teams.length < 2) {
      return NextResponse.json(
        { error: "Not enough teams to rebalance. Need at least 2 teams." },
        { status: 400 }
      )
    }
    
    // Check if any players are assigned to teams
    const totalAssignedPlayers = teams.reduce((count, team) => count + team.members.length, 0)
    
    // If no players are assigned to teams, get all registered players for the competition
    if (totalAssignedPlayers === 0) {
      // Get registered players from UserCompetition
      const registeredPlayers = await db.userCompetition.findMany({
        where: {
          competitionId,
          status: 'registered'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })
      
      if (registeredPlayers.length === 0) {
        return NextResponse.json(
          { error: "No registered players found for this competition" },
          { status: 400 }
        )
      }
      
      // Sort players by their final competition score
      const sortedPlayers = registeredPlayers
        .map(player => ({
          userId: player.user.id,
          name: player.user.name,
          score: player.finalCompetitionScore || 50 // Use finalCompetitionScore or default to 50
        }))
        .sort((a, b) => b.score - a.score)
      
      // Create new balanced teams using serpentine distribution
      const newTeamAssignments: Record<string, string[]> = {}
      
      // Initialize empty teams
      teams.forEach(team => {
        newTeamAssignments[team.id] = team.captainId ? [team.captainId] : []
      })
      
      // Serpentine draft for fair distribution
      const teamIds = Object.keys(newTeamAssignments)
      let forward = true
      let index = 0
      
      // First pass to distribute captains if they're in the player list
      const captains = teams
        .filter(team => team.captainId)
        .map(team => team.captainId) as string[]
      
      // Remove captains from the player pool (if they exist)
      const availablePlayers = sortedPlayers.filter(player => 
        !captains.includes(player.userId)
      )
      
      while (availablePlayers.length > 0) {
        // Determine team order based on direction
        const orderedTeamIds = forward 
          ? [...teamIds] 
          : [...teamIds].reverse()
        
        for (const teamId of orderedTeamIds) {
          if (availablePlayers.length === 0) break
          
          // Get the next player
          const player = availablePlayers.shift()
          if (player) {
            newTeamAssignments[teamId].push(player.userId)
          }
        }
        
        // Reverse direction for next round
        forward = !forward
      }
      
      // Update the database with new team assignments
      const updates = []
      
      for (const [teamId, memberIds] of Object.entries(newTeamAssignments)) {
        // Update team members
        updates.push(
          db.team.update({
            where: { id: teamId },
            data: { memberIds }
          })
        )
        
        // Update user team associations
        for (const userId of memberIds) {
          updates.push(
            db.user.update({
              where: { id: userId },
              data: { teamId }
            })
          )
        }
      }
      
      // Execute all updates in parallel
      await Promise.all(updates)
      
      // Revalidate relevant paths
      revalidatePath('/admin/teams')
      revalidatePath('/teams')
      revalidatePath('/dashboard')
      
      return NextResponse.json({
        success: true,
        updatedTeams: teams.length,
        assignedPlayers: sortedPlayers.length
      })
    }
    
    // If there are assigned players, proceed with rebalancing
    // Get all registered players with their final scores
    const registeredPlayers = await db.userCompetition.findMany({
      where: { competitionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    // Sort players by their final competition score
    const sortedPlayers = registeredPlayers
      .map(player => ({
        userId: player.user.id,
        name: player.user.name,
        score: player.finalCompetitionScore || 50 // Use finalCompetitionScore or default to 50
      }))
      .sort((a, b) => b.score - a.score)
    
    // Create new balanced teams using improved distribution
    const newTeamAssignments: Record<string, string[]> = {}
    
    // Initialize empty teams
    teams.forEach(team => {
      newTeamAssignments[team.id] = team.captainId ? [team.captainId] : []
    })
    
    // Calculate target team sizes
    const totalPlayers = sortedPlayers.length
    const numTeams = teams.length
    const baseTeamSize = Math.floor(totalPlayers / numTeams)
    const extraPlayers = totalPlayers % numTeams
    
    // Distribute players using improved algorithm
    const teamIds = Object.keys(newTeamAssignments)
    let currentTeamIndex = 0
    let direction = 1 // 1 for forward, -1 for backward
    
    // First pass: distribute players to achieve balanced team sizes
    for (let i = 0; i < sortedPlayers.length; i++) {
      const player = sortedPlayers[i]
      const teamId = teamIds[currentTeamIndex]
      
      // Skip if player is already a captain
      if (teams.some(team => team.captainId === player.userId)) {
        continue
      }
      
      newTeamAssignments[teamId].push(player.userId)
      
      // Move to next team
      currentTeamIndex += direction
      
      // Reverse direction when reaching the end
      if (currentTeamIndex >= teamIds.length || currentTeamIndex < 0) {
        direction *= -1
        currentTeamIndex += direction
      }
    }
    
    // Second pass: optimize team balance
    const maxIterations = 3 // Limit iterations to prevent infinite loops
    let iteration = 0
    
    while (iteration < maxIterations) {
      // Calculate team averages
      const teamAverages: Record<string, number> = {}
      for (const [teamId, memberIds] of Object.entries(newTeamAssignments)) {
        const teamScore = memberIds.reduce((sum, memberId) => {
          const player = sortedPlayers.find(p => p.userId === memberId)
          return sum + (player?.score || 50)
        }, 0)
        teamAverages[teamId] = teamScore / memberIds.length
      }
      
      // Find highest and lowest teams
      const teamsByAverage = Object.entries(teamAverages)
        .sort(([, a], [, b]) => b - a)
      
      const highestTeam = teamsByAverage[0]
      const lowestTeam = teamsByAverage[teamsByAverage.length - 1]
      
      // If the difference is small enough, we're done
      if (highestTeam[1] - lowestTeam[1] < 5) {
        break
      }
      
      // Try to swap players between highest and lowest teams
      const highestTeamMembers = newTeamAssignments[highestTeam[0]]
        .filter(id => !teams.find(t => t.captainId === id))
      const lowestTeamMembers = newTeamAssignments[lowestTeam[0]]
        .filter(id => !teams.find(t => t.captainId === id))
      
      // Find best swap to improve balance
      let bestSwap: { from: string; to: string } | null = null
      let bestImprovement = 0
      
      for (const highMember of highestTeamMembers) {
        for (const lowMember of lowestTeamMembers) {
          const highScore = sortedPlayers.find(p => p.userId === highMember)?.score || 50
          const lowScore = sortedPlayers.find(p => p.userId === lowMember)?.score || 50
          
          const currentDiff = highestTeam[1] - lowestTeam[1]
          const newHighAvg = (highestTeam[1] * highestTeamMembers.length - highScore + lowScore) / highestTeamMembers.length
          const newLowAvg = (lowestTeam[1] * lowestTeamMembers.length - lowScore + highScore) / lowestTeamMembers.length
          const newDiff = newHighAvg - newLowAvg
          
          if (currentDiff - newDiff > bestImprovement) {
            bestImprovement = currentDiff - newDiff
            bestSwap = { from: highMember, to: lowMember }
          }
        }
      }
      
      // If we found a good swap, make it
      if (bestSwap && bestImprovement > 0) {
        const highIndex = highestTeamMembers.indexOf(bestSwap.from)
        const lowIndex = lowestTeamMembers.indexOf(bestSwap.to)
        
        if (highIndex !== -1 && lowIndex !== -1) {
          newTeamAssignments[highestTeam[0]][highIndex] = bestSwap.to
          newTeamAssignments[lowestTeam[0]][lowIndex] = bestSwap.from
        }
      }
      
      iteration++
    }
    
    // Update the database with new team assignments
    const updates = []
    
    for (const [teamId, memberIds] of Object.entries(newTeamAssignments)) {
      // Update team members
      updates.push(
        db.team.update({
          where: { id: teamId },
          data: { memberIds }
        })
      )
      
      // Update user team associations
      for (const userId of memberIds) {
        updates.push(
          db.user.update({
            where: { id: userId },
            data: { teamId }
          })
        )
      }
    }
    
    // Execute all updates in parallel
    await Promise.all(updates)
    
    // Revalidate relevant paths
    revalidatePath('/admin/teams')
    revalidatePath('/teams')
    revalidatePath('/dashboard')
    
    return NextResponse.json({
      success: true,
      updatedTeams: teams.length
    })
  } catch (error) {
    console.error("Error rebalancing teams:", error)
    return NextResponse.json(
      { error: "Failed to rebalance teams" },
      { status: 500 }
    )
  }
} 