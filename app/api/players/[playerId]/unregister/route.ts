import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: { playerId: string } }
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

    const { competitionId } = await request.json()

    if (!competitionId) {
      return new NextResponse("Competition ID is required", { status: 400 })
    }

    // Use a transaction to ensure all operations succeed or fail together
    await prisma.$transaction(async (tx) => {
      // 1. Remove player from competition (UserCompetition)
      await tx.userCompetition.delete({
        where: {
          userId_competitionId: {
            userId: params.playerId,
            competitionId: competitionId
          }
        }
      })

      // 2. Delete all self-scores for this player in this competition
      await tx.playerSelfScore.deleteMany({
        where: {
          userId: params.playerId,
          competitionId: competitionId
        }
      })

      // 3. Delete all ratings given by this player in this competition
      await tx.playerRating.deleteMany({
        where: {
          raterId: params.playerId,
          competitionId: competitionId
        }
      })

      // 4. Delete all ratings received by this player in this competition
      await tx.playerRating.deleteMany({
        where: {
          ratedId: params.playerId,
          competitionId: competitionId
        }
      })

      // 5. Delete all captain votes made by this player
      await tx.captainVote.deleteMany({
        where: {
          voterId: params.playerId,
          teamId: {
            in: await tx.team.findMany({
              where: { competitionId },
              select: { id: true }
            }).then(teams => teams.map(t => t.id))
          }
        }
      })

      // 6. Delete all captain votes for this player
      await tx.captainVote.deleteMany({
        where: {
          captainId: params.playerId,
          teamId: {
            in: await tx.team.findMany({
              where: { competitionId },
              select: { id: true }
            }).then(teams => teams.map(t => t.id))
          }
        }
      })

      // 7. If player was a captain, remove them as captain
      await tx.team.updateMany({
        where: {
          competitionId: competitionId,
          captainId: params.playerId
        },
        data: {
          captainId: null
        }
      })
    })

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error("[PLAYER_UNREGISTER]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 