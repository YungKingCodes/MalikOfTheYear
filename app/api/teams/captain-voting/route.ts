import { NextResponse } from "next/server"

export async function GET() {
  try {
    // In a real implementation, this would query teams with a "captain_voting" status
    // For now, we'll create mock teams in captain voting
    const teamsInVoting = [
      {
        _id: "team7",
        name: "Team 7",
        members: 8,
        votesCast: 6,
        status: "in_progress",
      },
      {
        _id: "team8",
        name: "Team 8",
        members: 7,
        votesCast: 4,
        status: "in_progress",
      },
    ]

    return NextResponse.json(teamsInVoting)
  } catch (error) {
    console.error("Error fetching teams in captain voting:", error)
    return NextResponse.json({ error: "Failed to fetch teams in captain voting" }, { status: 500 })
  }
}

