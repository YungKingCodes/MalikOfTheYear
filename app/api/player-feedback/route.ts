import { NextResponse } from "next/server"
import { auth } from "@/auth"

interface FeedbackItem {
  id: string
  gameId: string
  gameName: string
  gameDate: string
  captainId: string
  captainName: string
  rating: "positive" | "negative"
  comment: string
  accolades: string[]
}

export async function GET(request: Request) {
  try {
    // Get the current user's session
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Get the player ID from the URL query params (for admin viewing other player's feedback)
    // Or default to the current user's ID
    const url = new URL(request.url)
    const playerId = url.searchParams.get("playerId") || session.user.id
    
    // If not admin and trying to view someone else's feedback, return error
    if (playerId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized to view this player's feedback" }, { status: 403 })
    }
    
    // For now, return mock data
    // In production, this would fetch from the database
    const mockFeedback: FeedbackItem[] = [
      {
        id: "1",
        gameId: "game1",
        gameName: "Basketball Tournament",
        gameDate: "2025-06-15T14:00:00Z",
        captainId: "captain1",
        captainName: "Alex Rodriguez",
        rating: "positive",
        comment: "Excellent performance! Your three-point shooting was crucial to our victory.",
        accolades: ["Sharpshooter", "Team Player"],
      },
      {
        id: "2",
        gameId: "game2",
        gameName: "Soccer Match",
        gameDate: "2025-06-10T15:30:00Z",
        captainId: "captain1",
        captainName: "Alex Rodriguez",
        rating: "positive",
        comment: "Great defensive work throughout the game. You prevented at least 3 goals!",
        accolades: ["Defensive Wall", "Tireless Runner"],
      },
      {
        id: "3",
        gameId: "game3",
        gameName: "Volleyball Tournament",
        gameDate: "2025-06-05T13:00:00Z",
        captainId: "captain1",
        captainName: "Alex Rodriguez",
        rating: "negative",
        comment: "Seemed distracted during the game. We need more focus in future matches.",
        accolades: [],
      }
    ]
    
    return NextResponse.json(mockFeedback)
  } catch (error) {
    console.error("Error fetching player feedback:", error)
    return NextResponse.json({ error: "Failed to fetch player feedback" }, { status: 500 })
  }
} 