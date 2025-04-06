import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"

export async function GET(request: Request) {
  try {
    // Verify authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get query parameters
    const url = new URL(request.url)
    const search = url.searchParams.get('search') || ''
    const role = url.searchParams.get('role') || ''
    const teamId = url.searchParams.get('team') || ''
    const hasTitles = url.searchParams.get('hasTitles') === 'true'

    // Build filter conditions
    const whereConditions: any = {}
    
    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (role) {
      whereConditions.role = role
    }
    
    if (teamId) {
      whereConditions.teamId = teamId
    }
    
    if (hasTitles) {
      whereConditions.titles = { isEmpty: false }
    }

    // Fetch users
    const users = await db.user.findMany({
      where: whereConditions,
      include: {
        team: true
      }
    })

    // Format users for the response
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      position: user.position,
      teamId: user.teamId,
      teamName: user.team?.name || "Unassigned",
      titles: user.titles || [],
      proficiencyScore: user.proficiencyScore || 0,
      proficiencies: user.proficiencies || [],
      createdAt: user.createdAt
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

