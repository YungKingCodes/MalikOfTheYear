import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/auth'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const withoutTeam = searchParams.get('withoutTeam') === 'true'
    
    // Build query
    const where: any = {}
    
    // Filter players without a team if requested
    if (withoutTeam) {
      where.teamId = null
    }
    
    // Get players from database
    const players = await db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        image: true,
        role: true,
        teamId: true,
        position: true,
        proficiencyScore: true
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    return NextResponse.json(players)
  } catch (error) {
    console.error("Error fetching players:", error)
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 }
    )
  }
} 