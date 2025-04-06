import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

interface PlayerAssignment {
  playerId: string
  playerName: string | null
  teamId: string
  confirmed: boolean
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Get the current user's session
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const gameId = params.id
    
    // Get game participations for this game
    const participations = await db.gameParticipation.findMany({
      where: {
        gameId: gameId
      },
      include: {
        player: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    
    // Transform the data to match the expected format
    const playerAssignments: PlayerAssignment[] = participations.map(participation => ({
      playerId: participation.playerId,
      playerName: participation.player.name,
      teamId: participation.teamId,
      confirmed: participation.status === 'confirmed'
    }))
    
    return NextResponse.json(playerAssignments)
  } catch (error) {
    console.error("Error fetching game assignments:", error)
    return NextResponse.json({ error: "Failed to fetch game assignments" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Only team captains or admins can assign players
    if (!session.user.role || (session.user.role !== 'captain' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: "Unauthorized: Only team captains and admins can assign players" }, { status: 403 })
    }
    
    const gameId = params.id
    const { playerIds, teamId } = await request.json()
    
    if (!Array.isArray(playerIds) || !teamId) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }
    
    // Validate that the user is the captain of this team or an admin
    if (session.user.role === 'captain') {
      const team = await db.team.findUnique({
        where: {
          id: teamId,
          captainId: session.user.id
        }
      })
      
      if (!team) {
        return NextResponse.json({ error: "You are not the captain of this team" }, { status: 403 })
      }
    }
    
    // Remove existing assignments for this team and game
    await db.gameParticipation.deleteMany({
      where: {
        gameId: gameId,
        teamId: teamId
      }
    })
    
    // Create new assignments
    const assignments = await Promise.all(
      playerIds.map(async (playerId: string) => {
        return db.gameParticipation.create({
          data: {
            gameId: gameId,
            playerId: playerId,
            teamId: teamId,
            status: 'pending'
          }
        })
      })
    )
    
    return NextResponse.json({ success: true, count: assignments.length })
  } catch (error) {
    console.error("Error assigning players to game:", error)
    return NextResponse.json({ error: "Failed to assign players" }, { status: 500 })
  }
}

