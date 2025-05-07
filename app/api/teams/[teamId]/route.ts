import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { teamId: string } }) {
  try {
    const teamId = params.teamId

    // Get team details with Prisma
    const team = await prisma.team.findUnique({
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
    const members = await prisma.user.findMany({
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

export async function DELETE(
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

    // First, remove all team members and captain votes
    await prisma.$transaction([
      // Remove team members
      prisma.user.updateMany({
        where: { teamId: params.teamId },
        data: { teamId: null }
      }),
      // Remove captain votes
      prisma.captainVote.deleteMany({
        where: { teamId: params.teamId }
      }),
      // Finally delete the team
      prisma.team.delete({
        where: { id: params.teamId }
      })
    ])

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[TEAM_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

