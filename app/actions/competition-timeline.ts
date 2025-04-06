"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { notFound } from "next/navigation"

/**
 * Fetches the competition timeline for the current active competition
 */
export async function getCompetitionTimeline() {
  const session = await auth()
  
  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view competition timeline")
  }

  try {
    // Get active competition
    const activeCompetition = await db.competition.findFirst({
      where: { status: "active" }
    })

    if (!activeCompetition) {
      notFound()
    }

    // Get competition phases
    const phases = await db.competitionPhase.findMany({
      where: { competitionId: activeCompetition.id },
      orderBy: { order: "asc" }
    })

    // Get event management data if it exists
    const eventManagement = await db.eventManagement.findUnique({
      where: { competitionId: activeCompetition.id }
    })

    // Format the phases for the timeline
    const timelinePhases = phases.map(phase => ({
      id: phase.id,
      title: phase.name,
      date: phase.endDate.toISOString(),
      status: mapPhaseStatus(phase.status),
      description: phase.description || `Phase: ${phase.name}`
    }))

    return {
      competition: {
        id: activeCompetition.id,
        name: activeCompetition.name,
        year: activeCompetition.year,
        startDate: activeCompetition.startDate.toISOString(),
        endDate: activeCompetition.endDate.toISOString(),
        currentPhase: eventManagement?.currentPhase || phases[0]?.name || "Not started"
      },
      phases: timelinePhases
    }
  } catch (error) {
    console.error("Failed to fetch competition timeline:", error)
    // Return default data in case of error
    return {
      competition: null,
      phases: []
    }
  }
}

/**
 * Maps the phase status from database to UI status
 */
function mapPhaseStatus(status: string): "completed" | "active" | "upcoming" {
  switch (status) {
    case "completed":
      return "completed"
    case "in-progress":
      return "active"
    case "pending":
    default:
      return "upcoming"
  }
} 