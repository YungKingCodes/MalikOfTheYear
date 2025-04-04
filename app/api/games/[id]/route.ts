import { NextResponse } from "next/server"
import { findDocument } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const gameId = params.id

    // Get game details
    const game = await findDocument("games", { _id: gameId })

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 })
    }

    // Mock additional game details that aren't in the database
    const gameDetails = {
      ...game,
      duration: "2 hours",
      rules: [
        "Standard rules apply",
        "Games are 20 minutes each",
        "Teams will play in a round-robin format",
        "Top 4 teams advance to semifinals",
        "Winners of semifinals play in the final match",
      ],
      requiresAllPlayers: game.type === "Team Sport",
      maxPlayers: game.type === "Team Sport" ? 5 : game.type === "Relay" ? 4 : 1,
    }

    return NextResponse.json(gameDetails)
  } catch (error) {
    console.error("Error fetching game:", error)
    return NextResponse.json({ error: "Failed to fetch game" }, { status: 500 })
  }
}

