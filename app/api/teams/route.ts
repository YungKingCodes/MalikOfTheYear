import { NextResponse } from "next/server"
import { findDocuments } from "@/lib/db"

export async function GET(request: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const competitionId = searchParams.get("competitionId")

    // Build query
    const query: any = {}
    if (competitionId) {
      query.competitionId = competitionId
    }

    // Get teams from database
    const teams = await findDocuments("teams", query, { sort: { score: -1 } })

    return NextResponse.json(teams)
  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 })
  }
}

