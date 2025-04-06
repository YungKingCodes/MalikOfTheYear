import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/competitions/active
export async function GET() {
  try {
    const activeCompetition = await db.competition.findFirst({
      where: { 
        status: "active" 
      },
      select: {
        id: true,
        name: true,
        year: true
      }
    })

    if (!activeCompetition) {
      return NextResponse.json(
        { error: "No active competition found" },
        { status: 404 }
      )
    }

    return NextResponse.json(activeCompetition)
  } catch (error) {
    console.error("Error fetching active competition:", error)
    return NextResponse.json(
      { error: "Failed to fetch active competition" },
      { status: 500 }
    )
  }
} 