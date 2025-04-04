import { NextResponse } from "next/server"
import { findDocuments } from "@/lib/db"

export async function GET(request: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get("teamId")
    const role = searchParams.get("role")

    // Build query
    const query: any = {}
    if (teamId) {
      query.teamId = teamId
    }
    if (role) {
      query.role = role
    }

    // Get users from database
    const users = await findDocuments("users", query)

    // Remove sensitive information
    const sanitizedUsers = users.map((user) => ({
      _id: user._id,
      name: user.name,
      role: user.role,
      teamId: user.teamId,
      position: user.position,
      titles: user.titles,
      // Only include proficiencyScore for captains and admins
      // In a real implementation, this would be handled by middleware
      // based on the authenticated user's role
      proficiencyScore: user.proficiencyScore,
    }))

    return NextResponse.json(sanitizedUsers)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

