import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { teamId: string } }) {
  try {
    const teamId = params.teamId

    // Get team details with Prisma
    const team = await db.team.findUnique({
      where: { id: teamId },
      include: {
        captain: {
          select: {
            id: true,
            name: true,
            image: true,
            position: true
          }
        }
      }
    })

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    // Get team members
    const members = await db.user.findMany({
      where: { teamId },
      select: {
        id: true,
        name: true,
        position: true,
        titles: true,
        image: true
      }
    })

    return NextResponse.json({
      ...team,
      members
    })
  } catch (error) {
    console.error("Error fetching team:", error)
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 })
  }
}

