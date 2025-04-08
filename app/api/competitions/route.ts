import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const competitions = await db.competition.findMany({
      orderBy: {
        year: "desc"
      },
      include: {
        teams: {
          include: {
            members: true
          }
        }
      }
    })

    // Get winner and goat information separately
    const competitionsWithDetails = await Promise.all(competitions.map(async (comp) => {
      let winnerTeam = null
      let goatUser = null

      if (comp.winnerId) {
        winnerTeam = await db.team.findUnique({
          where: { id: comp.winnerId },
          select: { name: true }
        })
      }

      if (comp.goatId) {
        goatUser = await db.user.findUnique({
          where: { id: comp.goatId },
          select: { name: true }
        })
      }

      return {
        id: comp.id,
        name: comp.name,
        year: comp.year,
        status: comp.status,
        startDate: comp.startDate,
        endDate: comp.endDate,
        description: comp.description,
        teams: comp.teams.length,
        totalPlayers: comp.teams.reduce((sum: number, team: any) => sum + team.members.length, 0),
        winnerTeam: winnerTeam?.name || null,
        goat: goatUser?.name || null
      }
    }))

    return NextResponse.json(competitionsWithDetails)
  } catch (error) {
    console.error("Error fetching competitions:", error)
    return NextResponse.json(
      { error: "Failed to fetch competitions" },
      { status: 500 }
    )
  }
}

