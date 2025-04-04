import { NextResponse } from "next/server"
import { findDocuments } from "@/lib/db"

export async function GET(request: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const year = searchParams.get("year")

    // Build query
    const query: any = {}
    if (status) {
      query.status = status
    }
    if (year) {
      query.year = Number.parseInt(year)
    }

    // Get competitions from database
    const competitions = await findDocuments("competitions", query, { sort: { year: -1 } })

    return NextResponse.json(competitions)
  } catch (error) {
    console.error("Error fetching competitions:", error)
    return NextResponse.json({ error: "Failed to fetch competitions" }, { status: 500 })
  }
}

