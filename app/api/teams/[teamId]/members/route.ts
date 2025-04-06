import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/auth'

export async function GET(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const teamId = params.teamId
    
    // Verify the team exists
    const team = await db.team.findUnique({
      where: { id: teamId },
    })
    
    if (!team) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      )
    }
    
    // Get all members of the team
    const members = await db.user.findMany({
      where: {
        teamId: teamId
      },
      select: {
        id: true,
        name: true,
        image: true,
        role: true
      }
    })
    
    return NextResponse.json(members)
  } catch (error) {
    console.error("Error fetching team members:", error)
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can modify team members" },
        { status: 403 }
      )
    }
    
    const teamId = params.teamId
    
    // Get request body with userId
    const body = await request.json()
    const { userId } = body
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }
    
    // Verify team exists
    const team = await db.team.findUnique({
      where: { id: teamId },
      include: {
        members: true
      }
    })
    
    if (!team) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      )
    }
    
    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }
    
    // Check if user is already on this team
    const isAlreadyMember = team.members.some(member => member.id === userId)
    if (isAlreadyMember) {
      return NextResponse.json(
        { error: "User is already a member of this team" },
        { status: 400 }
      )
    }
    
    // Check if user is on another team in the same competition
    if (user.teamId) {
      const userCurrentTeam = await db.team.findUnique({
        where: { id: user.teamId },
        select: { 
          id: true,
          competitionId: true 
        }
      })
      
      if (userCurrentTeam && userCurrentTeam.competitionId === team.competitionId && userCurrentTeam.id !== teamId) {
        return NextResponse.json(
          { error: "User is already on another team in the same competition" },
          { status: 400 }
        )
      }
    }
    
    // Update user's team
    await db.user.update({
      where: { id: userId },
      data: { teamId: teamId }
    })
    
    // Update team's memberIds if not already in the list
    if (!team.memberIds.includes(userId)) {
      await db.team.update({
        where: { id: teamId },
        data: {
          memberIds: {
            push: userId
          }
        }
      })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error adding team member:", error)
    return NextResponse.json(
      { error: "Failed to add team member" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can modify team members" },
        { status: 403 }
      )
    }
    
    const teamId = params.teamId
    
    // Get request body with userId from URL search params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }
    
    // Verify team exists
    const team = await db.team.findUnique({
      where: { id: teamId }
    })
    
    if (!team) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      )
    }
    
    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }
    
    // Check if user is a member of this team
    if (user.teamId !== teamId) {
      return NextResponse.json(
        { error: "User is not a member of this team" },
        { status: 400 }
      )
    }
    
    // Check if user is the team captain
    if (team.captainId === userId) {
      // Remove captain from team
      await db.team.update({
        where: { id: teamId },
        data: { captainId: null }
      })
    }
    
    // Update user's team
    await db.user.update({
      where: { id: userId },
      data: { teamId: null }
    })
    
    // Remove user from team's memberIds
    await db.team.update({
      where: { id: teamId },
      data: {
        memberIds: {
          set: team.memberIds.filter(id => id !== userId)
        }
      }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing team member:", error)
    return NextResponse.json(
      { error: "Failed to remove team member" },
      { status: 500 }
    )
  }
} 