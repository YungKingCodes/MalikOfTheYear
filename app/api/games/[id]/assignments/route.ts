import { NextResponse } from "next/server"

// Mock player assignments data
const playerAssignments = {
  game1: [
    { playerId: "user1", playerName: "Sarah Johnson", teamId: "team1", confirmed: true },
    { playerId: "user4", playerName: "Emily Rodriguez", teamId: "team1", confirmed: true },
    { playerId: "user6", playerName: "Player 6", teamId: "team1", confirmed: false },
    { playerId: "user8", playerName: "Player 8", teamId: "team1", confirmed: true },
    { playerId: "user10", playerName: "Player 10", teamId: "team1", confirmed: true },
  ],
  game2: [
    { playerId: "user2", playerName: "Michael Chen", teamId: "team2", confirmed: true },
    { playerId: "user5", playerName: "David Kim", teamId: "team2", confirmed: true },
    { playerId: "user7", playerName: "Player 7", teamId: "team2", confirmed: true },
    { playerId: "user9", playerName: "Player 9", teamId: "team2", confirmed: false },
  ],
  game3: [],
  game4: [],
  game5: [],
  game6: [],
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const gameId = params.id

  // Return empty array if no assignments exist
  const assignments = playerAssignments[gameId as keyof typeof playerAssignments] || []

  return NextResponse.json(assignments)
}

