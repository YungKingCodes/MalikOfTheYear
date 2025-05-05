import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"

export async function GET(request: Request) {
  try {
    // Authenticate user
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const competitionId = searchParams.get('competitionId')
    const includeScores = searchParams.get('includeScores') === 'true'
    
    console.log(`API request: Get teams for competition: ${competitionId}, includeScores: ${includeScores}`)
    
    // Validate competitionId
    if (!competitionId) {
      console.log('API error: No competitionId provided')
      return NextResponse.json(
        { error: "Competition ID is required" },
        { status: 400 }
      )
    }

    // Get teams for the specified competition
    const teams = await db.team.findMany({
      where: {
        competitionId: competitionId
      },
      select: {
        id: true,
        name: true,
        score: true,
        maxScore: true,
        captainId: true,
        memberIds: true,
        competitionId: true,
      },
      orderBy: {
        name: 'asc'
      }
    })

    console.log(`Found ${teams.length} teams for competition ${competitionId}`)
    
    // If no teams, return empty array
    if (!teams.length) {
      return NextResponse.json([])
    }

    // Get all members and captains for these teams
    const allMemberIds = teams.flatMap(team => team.memberIds)
    const captainIds = teams.map(team => team.captainId).filter(Boolean) as string[]
    
    // Get user data for all members
    const users = await db.user.findMany({
      where: {
        id: { in: [...new Set([...allMemberIds, ...captainIds])] }
      },
      select: {
        id: true,
        name: true,
        image: true,
        role: true
      }
    })
    
    // Create maps for faster lookups
    const userMap = new Map(users.map(user => [user.id, user]))

    let teamWithScores;
    
    // If scores are requested, fetch all player scores for this competition
    if (includeScores) {
      // Get all self assessment scores and peer ratings for this competition
      const [selfScores, peerRatings] = await Promise.all([
        db.playerSelfScore.findMany({
          where: { competitionId }
        }),
        db.playerRating.findMany({
          where: { competitionId }
        })
      ])
      
      // Create maps for scores
      const selfScoreMap = new Map()
      selfScores.forEach(score => {
        if (!selfScoreMap.has(score.userId)) {
          selfScoreMap.set(score.userId, [])
        }
        selfScoreMap.get(score.userId).push(score)
      })
      
      const peerRatingMap = new Map()
      peerRatings.forEach(rating => {
        if (!peerRatingMap.has(rating.ratedId)) {
          peerRatingMap.set(rating.ratedId, [])
        }
        peerRatingMap.get(rating.ratedId).push(rating)
      })
      
      // Calculate player scores
      const playerScores = new Map()
      
      for (const userId of allMemberIds) {
        // Skip if user not found
        if (!userMap.has(userId)) continue
        
        // Get self scores and peer ratings
        const userSelfScores = selfScoreMap.get(userId) || []
        const userPeerRatings = peerRatingMap.get(userId) || []
        
        // Calculate average self score
        let selfScoreAvg = 0
        if (userSelfScores.length > 0) {
          const selfScoreSum = userSelfScores.reduce((sum: number, score: any) => {
            const scoreValues = Object.values(score.scores as Record<string, number>)
            return sum + scoreValues.reduce((s: number, v: number) => s + v, 0) / scoreValues.length
          }, 0)
          selfScoreAvg = selfScoreSum / userSelfScores.length
        }
        
        // Calculate average peer score
        let peerScoreAvg = 0
        if (userPeerRatings.length > 0) {
          const peerScoreSum = userPeerRatings.reduce((sum: number, rating: any) => {
            const scoreValues = Object.values(rating.scores as Record<string, number>)
            return sum + scoreValues.reduce((s: number, v: number) => s + v, 0) / scoreValues.length
          }, 0)
          peerScoreAvg = peerScoreSum / userPeerRatings.length
        }
        
        // Calculate final score with 40/60 weighting
        let finalScore = 0
        
        if (userSelfScores.length > 0 || userPeerRatings.length > 0) {
          if (userSelfScores.length > 0 && userPeerRatings.length > 0) {
            finalScore = Math.round(selfScoreAvg * 0.4 + peerScoreAvg * 0.6)
          } else if (userSelfScores.length > 0) {
            finalScore = Math.round(selfScoreAvg)
          } else if (userPeerRatings.length > 0) {
            finalScore = Math.round(peerScoreAvg)
          }
          
          // Convert from 1-5 scale to 0-100 scale
          finalScore = Math.round((finalScore / 5) * 100)
        }
        
        playerScores.set(userId, finalScore)
      }
      
      // Process teams with scores
      teamWithScores = teams.map(team => {
        // Calculate team average score from player scores
        const teamMembers = team.memberIds
          .filter(id => userMap.has(id))
          .map(id => ({
            id,
            name: userMap.get(id)?.name,
            score: playerScores.get(id) || 0
          }))
        
        const totalScore = teamMembers.reduce((sum, member) => sum + member.score, 0)
        const averageScore = teamMembers.length > 0 ? Math.round(totalScore / teamMembers.length) : 0
        
        return {
          id: team.id,
          name: team.name,
          score: team.score,
          maxScore: team.maxScore,
          memberCount: team.memberIds.length,
          memberIds: team.memberIds,
          captainId: team.captainId,
          captain: team.captainId ? userMap.get(team.captainId) : null,
          competitionId: team.competitionId,
          averagePlayerScore: averageScore,
          highestPlayerScore: teamMembers.length > 0 ? Math.max(...teamMembers.map(m => m.score)) : 0,
          lowestPlayerScore: teamMembers.length > 0 ? Math.min(...teamMembers.map(m => m.score)) : 0
        }
      })
    } else {
      // Basic team info without scores
      teamWithScores = teams.map(team => ({
        id: team.id,
        name: team.name,
        score: team.score,
        maxScore: team.maxScore,
        memberCount: team.memberIds.length,
        memberIds: team.memberIds,
        captainId: team.captainId,
        captain: team.captainId ? userMap.get(team.captainId) : null,
        competitionId: team.competitionId
      }))
    }

    return NextResponse.json(teamWithScores)
  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Verify the user is authenticated and an admin
    const session = await auth()
    
    if (!session?.user) {
      console.error("Unauthorized: No user session found")
      return NextResponse.json(
        { error: "Unauthorized: You must be logged in" },
        { status: 401 }
      )
    }
    
    if (session.user.role !== "admin") {
      console.error("Unauthorized: User role is not admin", { role: session.user.role })
      return NextResponse.json(
        { error: "Unauthorized: Only admins can create teams" },
        { status: 403 }
      )
    }

    // Get the team data from the request
    const body = await request.json()
    console.log("Received team creation request:", body)
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: "Team name is required" },
        { status: 400 }
      )
    }
    
    if (!body.competitionId) {
      return NextResponse.json(
        { error: "Competition ID is required" },
        { status: 400 }
      )
    }
    
    // Verify the competition exists
    const competition = await db.competition.findUnique({
      where: { id: body.competitionId }
    })
    
    if (!competition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 }
      )
    }
    
    // Create the team
    try {
      const teamData: any = {
        name: body.name,
        competitionId: body.competitionId,
        score: 0,
        memberIds: []
      }

      // Add captain if provided
      if (body.captainId) {
        // Verify captain exists
        const captain = await db.user.findUnique({
          where: { id: body.captainId }
        })
        
        if (!captain) {
          return NextResponse.json(
            { error: "Captain not found" },
            { status: 404 }
          )
        }
        
        teamData.captainId = body.captainId
        // Add captain to members list if they exist
        teamData.memberIds.push(body.captainId)
      }
      
      const team = await db.team.create({
        data: teamData
      })
      
      console.log("Team created successfully:", { id: team.id, name: team.name })
      
      // Update the competition's teamIds if it doesn't already include this team
      if (!competition.teamIds.includes(team.id)) {
        await db.competition.update({
          where: { id: body.competitionId },
          data: {
            teamIds: {
              push: team.id
            }
          }
        })
      }
      
      return NextResponse.json(team)
    } catch (dbError) {
      console.error("Database error creating team:", dbError)
      return NextResponse.json(
        { error: "Database error: " + (dbError instanceof Error ? dbError.message : "Unknown error") },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error creating team:", error)
    return NextResponse.json(
      { error: "Failed to create team: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    )
  }
}

