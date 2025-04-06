import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"

export async function GET() {
  try {
    const session = await auth()
    const userId = session?.user?.id
    
    // If user is not logged in
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    let team = null
    
    // First check if user has a team
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { teamId: true }
    })
    
    // If user belongs to a team, get that team
    if (user?.teamId) {
      team = await db.team.findUnique({
        where: { id: user.teamId },
        include: {
          captain: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          members: {
            select: {
              id: true,
              name: true,
              image: true,
              proficiencyScore: true
            }
          }
        }
      })
    }
    
    // If user doesn't have a team or their team wasn't found, get the first team
    if (!team) {
      team = await db.team.findFirst({
        include: {
          captain: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          members: {
            select: {
              id: true,
              name: true,
              image: true,
              proficiencyScore: true
            }
          }
        }
      })
    }
    
    if (!team) {
      return NextResponse.json({ error: "No teams found" }, { status: 404 })
    }
    
    return NextResponse.json(team)
  } catch (error) {
    console.error("Error fetching team data:", error)
    return NextResponse.json({ error: "Failed to fetch team data" }, { status: 500 })
  }
} 