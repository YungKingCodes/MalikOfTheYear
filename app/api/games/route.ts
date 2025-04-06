import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"

export async function GET(request: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const competitionId = searchParams.get("competitionId")
    const status = searchParams.get("status")
    const teamId = searchParams.get("teamId")

    // Build query
    const query: any = {}
    if (competitionId) {
      query.competitionId = competitionId
    }
    if (status) {
      query.status = status
    }

    // Get games from database
    const games = await db.game.findMany({
      where: query,
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
      },
      orderBy: {
        date: teamId ? undefined : 'asc'
      }
    })

    // If we're filtering by team, we need to do additional filtering
    let filteredGames = games
    if (teamId) {
      filteredGames = games.filter((game) => {
        return game.participants.some(p => p.teamId === teamId)
      })
    }

    return NextResponse.json(filteredGames)
  } catch (error) {
    console.error("Error fetching games:", error)
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 })
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
        { error: "Unauthorized: Only admins can create games" },
        { status: 403 }
      )
    }

    // Get the game data from the request
    const body = await request.json()
    console.log("Received game creation request:", body)
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: "Game name is required" },
        { status: 400 }
      )
    }
    
    // Don't require competitionId for games added to the pool
    let competition = null;
    if (body.competitionId) {
      // Verify the competition exists
      competition = await db.competition.findUnique({
        where: { id: body.competitionId }
      })
      
      if (!competition) {
        return NextResponse.json(
          { error: "Competition not found" },
          { status: 404 }
        )
      }
    }
    
    // Create the game
    try {
      const game = await db.game.create({
        data: {
          name: body.name,
          description: body.description || "",
          type: body.type || "physical",
          category: body.category || "sports",
          playerCount: body.playerCount || 0,
          duration: body.duration || 30,
          pointsValue: body.pointsValue || 10,
          location: body.location || "TBD",
          status: body.status || "scheduled",
          competitionId: body.competitionId || null,
          date: body.date ? new Date(body.date) : null,
          difficulty: body.difficulty || "Medium",
          winCondition: body.winCondition || "Score",
          materialsNeeded: body.materialsNeeded || null,
          cost: body.cost || null
        }
      })
      
      console.log("Game created successfully:", { id: game.id, name: game.name })
      
      // Update the competition's gameIds if it doesn't already include this game
      if (competition && !competition.gameIds.includes(game.id)) {
        await db.competition.update({
          where: { id: body.competitionId },
          data: {
            gameIds: {
              push: game.id
            }
          }
        })
      }
      
      return NextResponse.json(game)
    } catch (dbError) {
      console.error("Database error creating game:", dbError)
      return NextResponse.json(
        { error: "Database error: " + (dbError instanceof Error ? dbError.message : "Unknown error") },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error creating game:", error)
    return NextResponse.json(
      { error: "Failed to create game: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    )
  }
}

