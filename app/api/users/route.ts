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
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get("teamId")
    const role = searchParams.get("role")
    const search = searchParams.get("search")
    const excludeTeamId = searchParams.get("excludeTeamId")
    
    // Build query
    const query: any = {}
    
    // Filter by team if specified
    if (teamId) {
      query.teamId = teamId
    }
    
    // Filter by role if specified
    if (role) {
      query.role = role
    }
    
    // Search by name or email if search term is provided
    if (search) {
      query.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          email: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ]
    }
    
    // Exclude users from a specific team
    if (excludeTeamId) {
      query.NOT = {
        teamId: excludeTeamId
      }
    }
    
    // Get users from database with proper access control
    // Only admins can see all users, others have restricted access
    const isAdmin = session.user.role === "admin"
    
    const users = await db.user.findMany({
      where: query,
      select: {
        id: true,
        name: true,
        email: isAdmin ? true : false, // Only admins can see emails
        image: true,
        role: true,
        teamId: true,
        position: true
      },
      orderBy: {
        name: 'asc'
      },
      take: 20 // Limit results to prevent overloading
    })
    
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

