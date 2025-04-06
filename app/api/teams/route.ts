import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"

export async function GET(request: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const competitionId = searchParams.get("competitionId")

    // Build query
    const query: any = {}
    if (competitionId) {
      query.competitionId = competitionId
    }

    // Get teams from database with member and captain information
    const teams = await db.team.findMany({
      where: query,
      orderBy: {
        score: 'desc'
      },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        captain: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json(teams)
  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Verify the user is authenticated and an admin
    const session = await auth()
    
    if (!session?.user) {
      console.error("Unauthorized: No user session found")
      return NextResponse.json(
        { error: "Unauthorized: You must be logged in" },
        { status: 401 }
      )
    }
    
    if (session.user.role !== "admin") {
      console.error("Unauthorized: User role is not admin", { role: session.user.role })
      return NextResponse.json(
        { error: "Unauthorized: Only admins can create teams" },
        { status: 403 }
      )
    }

    // Get the team data from the request
    const body = await request.json()
    console.log("Received team creation request:", body)
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: "Team name is required" },
        { status: 400 }
      )
    }
    
    if (!body.competitionId) {
      return NextResponse.json(
        { error: "Competition ID is required" },
        { status: 400 }
      )
    }
    
    // Verify the competition exists
    const competition = await db.competition.findUnique({
      where: { id: body.competitionId }
    })
    
    if (!competition) {
      return NextResponse.json(
        { error: "Competition not found" },
        { status: 404 }
      )
    }
    
    // Create the team
    try {
      const teamData: any = {
        name: body.name,
        competitionId: body.competitionId,
        score: 0,
        memberIds: []
      }

      // Add captain if provided
      if (body.captainId) {
        // Verify captain exists
        const captain = await db.user.findUnique({
          where: { id: body.captainId }
        })
        
        if (!captain) {
          return NextResponse.json(
            { error: "Captain not found" },
            { status: 404 }
          )
        }
        
        teamData.captainId = body.captainId
        // Add captain to members list if they exist
        teamData.memberIds.push(body.captainId)
      }
      
      const team = await db.team.create({
        data: teamData
      })
      
      console.log("Team created successfully:", { id: team.id, name: team.name })
      
      // Update the competition's teamIds if it doesn't already include this team
      if (!competition.teamIds.includes(team.id)) {
        await db.competition.update({
          where: { id: body.competitionId },
          data: {
            teamIds: {
              push: team.id
            }
          }
        })
      }
      
      return NextResponse.json(team)
    } catch (dbError) {
      console.error("Database error creating team:", dbError)
      return NextResponse.json(
        { error: "Database error: " + (dbError instanceof Error ? dbError.message : "Unknown error") },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error creating team:", error)
    return NextResponse.json(
      { error: "Failed to create team: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    )
  }
}

