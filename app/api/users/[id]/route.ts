import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = params.id

    // Fetch complete user data with relations
    const user = await db.user.findUnique({
      where: { 
        id: userId 
      },
      include: {
        team: {
          include: {
            captain: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        },
        competitions: {
          include: {
            competition: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get team name
    let teamName = "Unassigned"
    if (user.team) {
      teamName = user.team.name
    }

    // Get game participations for win/loss stats
    const gameParticipations = user.team ? await db.gameParticipation.findMany({
      where: { 
        teamId: user.team.id 
      },
      include: {
        game: true
      }
    }) : []

    // Calculate wins and losses
    const completedGames = gameParticipations.filter(p => p.game.status === "completed")
    const wins = completedGames.filter(p => p.rank === 1).length
    const losses = completedGames.length - wins

    // Format competitions
    const competitions = user.competitions.map(uc => ({
      id: uc.competition.id,
      name: uc.competition.name,
      startDate: uc.competition.startDate,
      endDate: uc.competition.endDate,
      status: uc.competition.status,
      year: uc.competition.year
    }))

    // Get awards/accolades (this is a mock as there's no direct awards table)
    // In a real application, this would come from a dedicated awards collection
    const awards = user.titles.map(title => ({
      name: title,
      date: title.includes("'24") ? "2024-01-01T00:00:00Z" : "2023-01-01T00:00:00Z"
    }))

    // Construct response with complete player details
    const playerDetails = {
      id: user.id,
      _id: user.id, // Include _id for backward compatibility
      name: user.name,
      email: user.email,
      image: user.image,
      position: user.position,
      role: user.role,
      teamId: user.teamId,
      teamName: teamName,
      proficiencyScore: user.proficiencyScore || 0,
      wins: wins,
      losses: losses,
      titles: user.titles || [],
      proficiencies: user.proficiencies || [],
      competitions: competitions,
      awards: awards,
      createdAt: user.createdAt
    }
    
    return NextResponse.json(playerDetails)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

