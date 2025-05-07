import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Check if user is an admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || user.role.toLowerCase() !== "admin") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Reset captain voting for the team
    await prisma.$transaction([
      // Delete all captain votes
      prisma.captainVote.deleteMany({
        where: { teamId: params.teamId }
      }),
      // Update team to remove captain
      prisma.team.update({
        where: { id: params.teamId },
        data: {
          captainId: null
        }
      })
    ])

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error("[TEAM_RESET_CAPTAIN_VOTING]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 