import { NextResponse } from "next/server"
import { findDocuments } from "@/lib/db"

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
    if (teamId) {
      // This is a simplified approach - in a real DB we'd use $or
      query.team1 = teamId // This is not accurate for MongoDB, just for our mock
    }

    // Get games from database
    const games = await findDocuments("games", query, { sort: { date: 1 } })

    // If we're filtering by team, we need to do additional filtering
    // since our mock DB doesn't support complex queries
    let filteredGames = games
    if (teamId) {
      filteredGames = games.filter((game) => game.team1 === teamId || game.team2 === teamId)
    }

    return NextResponse.json(filteredGames)
  } catch (error) {
    console.error("Error fetching games:", error)
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 })
  }
}

