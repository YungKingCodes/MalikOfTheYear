import { db } from "@/lib/db"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch all competitions that are either active, upcoming or inactive
    // Order them by status priority (active first, then upcoming, then inactive)
    // and within each status group by start date
    const competitions = await db.competition.findMany({
      where: {
        status: { in: ["active", "upcoming", "inactive"] }
      },
      orderBy: [
        {
          status: "asc" // This will put "active" first, as it comes before "inactive" and "upcoming" alphabetically
        },
        {
          startDate: "asc"
        }
      ],
      select: {
        id: true,
        name: true,
        year: true,
        status: true,
        startDate: true,
        endDate: true
      }
    })

    return NextResponse.json({ 
      competitions,
      count: competitions.length 
    })
  } catch (error) {
    console.error("Error fetching available competitions:", error)
    return NextResponse.json(
      { error: "Failed to fetch competitions" },
      { status: 500 }
    )
  }
} 