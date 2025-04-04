import { NextResponse } from "next/server"
import { findDocument, findDocuments } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const teamId = params.id

    // Get team details
    const team = await findDocument("teams", { _id: teamId })

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 })
    }

    // Get team members
    const members = await findDocuments("users", { teamId })

    // Remove sensitive information from members
    const sanitizedMembers = members.map((member) => ({
      _id: member._id,
      name: member.name,
      position: member.position,
      titles: member.titles,
      // Only include proficiencyScore for captains and admins
      // In a real implementation, this would be handled by middleware
      // based on the authenticated user's role
      proficiencyScore: member.proficiencyScore,
    }))

    return NextResponse.json({
      ...team,
      members: sanitizedMembers,
    })
  } catch (error) {
    console.error("Error fetching team:", error)
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 })
  }
}

