import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/auth'

export async function GET(request: Request, { params }: { params: { phaseId: string } }) {
  try {
    // Authenticate user
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const phaseId = params.phaseId
    
    if (!phaseId) {
      return NextResponse.json(
        { error: "Phase ID is required" },
        { status: 400 }
      )
    }

    // Get the user's vote for this phase
    const vote = await db.captainVote.findFirst({
      where: {
        voterId: session.user.id,
        phaseId: phaseId
      },
      select: {
        id: true,
        captainId: true,
        teamId: true,
        createdAt: true
      }
    })

    return NextResponse.json({ vote })
  } catch (error) {
    console.error("Error fetching captain vote:", error)
    return NextResponse.json(
      { error: "Failed to fetch captain vote" },
      { status: 500 }
    )
  }
} 