import { NextResponse } from "next/server"

export async function GET() {
  try {
    // In a real implementation, this would query a "suggested_games" collection
    // For now, we'll create mock suggested games based on our mock data
    const suggestedGames = [
      {
        _id: "suggestion1",
        name: "Tug of War",
        type: "Team Sport",
        status: "suggested",
        votes: 12,
        suggested: true,
      },
      {
        _id: "suggestion2",
        name: "Chess Tournament",
        type: "Strategy",
        status: "suggested",
        votes: 8,
        suggested: true,
      },
      {
        _id: "suggestion3",
        name: "Archery Competition",
        type: "Individual",
        status: "suggested",
        votes: 5,
        suggested: true,
      },
    ]

    return NextResponse.json(suggestedGames)
  } catch (error) {
    console.error("Error fetching suggested games:", error)
    return NextResponse.json({ error: "Failed to fetch suggested games" }, { status: 500 })
  }
}

