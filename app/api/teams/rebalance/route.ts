import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

// Define interfaces for better type checking
interface PlayerWithScore {
  userId: string;
  name: string | null;
  score: number;
  isCaptain: boolean;
}

interface OtherTeamPlayer extends PlayerWithScore {
  teamId: string;
}

interface PlayerSwap {
  currentPlayer: PlayerWithScore;
  newPlayer: OtherTeamPlayer;
}

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
    
    const { teamId, strategy } = data
    
    if (!teamId) {
      return NextResponse.json({ error: "Team ID is required" }, { status: 400 })
    }
    
    // Verify team exists and get competition ID
    const team = await db.team.findUnique({
      where: { id: teamId },
      include: {
        members: true
      }
    })
    
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }
    
    const competitionId = team.competitionId
    
    // Get other teams in the same competition
    const otherTeams = await db.team.findMany({
      where: { 
        competitionId,
        id: { not: teamId }
      },
      include: {
        members: true
      }
    })
    
    if (otherTeams.length === 0) {
      return NextResponse.json(
        { error: "No other teams found in the competition for balancing" },
        { status: 400 }
      )
    }
    
    // Get player scores for this competition
    const playerScores = await db.playerSelfScore.findMany({
      where: { competitionId }
    })
    
    // Create a map of user IDs to their scores
    const userScores: Record<string, number> = {}
    
    // Process self-scores
    playerScores.forEach(score => {
      // Extract score from scores JSON field
      const playerScore = score.scores && typeof score.scores === 'object' ? 
                       (score.scores as any).overall || 50 : 50
      
      userScores[score.userId] = playerScore
    })
    
    // Calculate team average scores
    const targetTeamMembers: PlayerWithScore[] = team.members.map(member => ({
      userId: member.id,
      name: member.name,
      score: userScores[member.id] || 50, // Default score if none found
      isCaptain: team.captainId === member.id
    }))
    
    const targetTeamAvg = targetTeamMembers.reduce((sum, m) => sum + m.score, 0) / 
                          (targetTeamMembers.length || 1)
    
    // Calculate scores for other teams
    const otherTeamMembers: OtherTeamPlayer[] = otherTeams.flatMap(t => 
      t.members.map(member => ({
        userId: member.id,
        name: member.name,
        score: userScores[member.id] || 50,
        teamId: t.id,
        isCaptain: t.captainId === member.id
      }))
    )
    
    // Filter out captains who shouldn't be moved
    const availableMembers = otherTeamMembers.filter(m => !m.isCaptain)
    
    // Find suitable players to swap based on strategy
    const swapsToMake: PlayerSwap[] = []
    
    if (strategy === "balanced") {
      // Sort team members by score (excluding captain)
      const sortedTargetMembers = targetTeamMembers
        .filter(m => !m.isCaptain)
        .sort((a, b) => a.score - b.score)
      
      // For each team member (starting from the lowest skill)
      for (const member of sortedTargetMembers) {
        // Find a player from another team with a similar skill level
        // who would improve the balance of the team
        const targetScore = targetTeamAvg // We want to move toward the average
        
        let bestSwapCandidate: OtherTeamPlayer | null = null
        let bestScoreDifference = Infinity
        
        for (const candidate of availableMembers) {
          // Skip if already selected for a swap
          if (swapsToMake.some(swap => swap.newPlayer.userId === candidate.userId)) {
            continue
          }
          
          // Calculate how this swap would affect the team average
          const newTeamScore = targetTeamMembers.reduce((sum, m) => {
            if (m.userId === member.userId) return sum // Skip the member being replaced
            return sum + m.score
          }, 0) + candidate.score
          
          const newAverage = newTeamScore / targetTeamMembers.length
          const scoreDifference = Math.abs(newAverage - targetScore)
          
          // If this is a better match, update our selection
          if (scoreDifference < bestScoreDifference) {
            bestScoreDifference = scoreDifference
            bestSwapCandidate = candidate
          }
        }
        
        // If we found a suitable candidate, add the swap to our list
        if (bestSwapCandidate) {
          swapsToMake.push({
            currentPlayer: member,
            newPlayer: bestSwapCandidate
          })
          
          // Remove this candidate from future consideration
          availableMembers.splice(availableMembers.indexOf(bestSwapCandidate), 1)
          
          // Only make a limited number of swaps
          if (swapsToMake.length >= 2) break
        }
      }
    }
    
    // Execute the swaps
    const updates = []
    
    for (const swap of swapsToMake) {
      // Update the teams' memberIds
      const sourceTeam = await db.team.findUnique({
        where: { id: teamId },
        select: { memberIds: true }
      })
      
      const targetTeam = await db.team.findUnique({
        where: { id: swap.newPlayer.teamId },
        select: { memberIds: true }
      })
      
      if (sourceTeam && targetTeam) {
        // Remove current player from source team
        const updatedSourceMembers = sourceTeam.memberIds.filter(
          id => id !== swap.currentPlayer.userId
        )
        
        // Add new player to source team
        updatedSourceMembers.push(swap.newPlayer.userId)
        
        // Remove new player from target team
        const updatedTargetMembers = targetTeam.memberIds.filter(
          id => id !== swap.newPlayer.userId
        )
        
        // Add current player to target team
        updatedTargetMembers.push(swap.currentPlayer.userId)
        
        // Update the teams
        updates.push(
          db.team.update({
            where: { id: teamId },
            data: { memberIds: updatedSourceMembers }
          }),
          db.team.update({
            where: { id: swap.newPlayer.teamId },
            data: { memberIds: updatedTargetMembers }
          })
        )
        
        // Update the players' team associations
        updates.push(
          db.user.update({
            where: { id: swap.currentPlayer.userId },
            data: { teamId: swap.newPlayer.teamId }
          }),
          db.user.update({
            where: { id: swap.newPlayer.userId },
            data: { teamId: teamId }
          })
        )
      }
    }
    
    // Execute all updates
    if (updates.length > 0) {
      await Promise.all(updates)
      
      // Revalidate relevant paths
      revalidatePath('/admin/teams')
      revalidatePath(`/admin/teams/${teamId}`)
      revalidatePath(`/admin/teams/${teamId}/edit`)
      revalidatePath('/teams')
      revalidatePath('/dashboard')
    }
    
    return NextResponse.json({
      success: true,
      swapsMade: swapsToMake.length,
      newTeam: await db.team.findUnique({
        where: { id: teamId },
        include: { members: true }
      })
    })
  } catch (error) {
    console.error("Error rebalancing team:", error)
    return NextResponse.json(
      { error: "Failed to rebalance team" },
      { status: 500 }
    )
  }
} 