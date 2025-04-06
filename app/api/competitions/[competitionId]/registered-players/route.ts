import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/auth'
import { Prisma } from '@prisma/client'

export async function GET(
  req: NextRequest,
  { params }: { params: { competitionId: string } }
) {
  const session = await auth()
  
  // Check if the user is authenticated
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const { competitionId } = params
    const { searchParams } = new URL(req.url)
    const unassignedOnly = searchParams.get('unassignedOnly') === 'true'
    const query = searchParams.get('q') || ''
    
    console.log(`Request for competition ID: ${competitionId}`)
    console.log(`Query params: unassignedOnly=${unassignedOnly}, q=${query}`)
    
    // First, check all possible statuses for user competition records
    const statusCounts = await db.userCompetition.groupBy({
      by: ['status'],
      where: { competitionId },
      _count: true
    })
    
    console.log('User competition status counts:', JSON.stringify(statusCounts))
    
    // Let's directly query to see if any UserCompetition records exist
    const userCompCount = await db.userCompetition.count({
      where: { competitionId }
    })
    
    console.log(`Total UserCompetition records found for competition ${competitionId}: ${userCompCount}`)
    
    // Get registrations with any status
    const registrations = await db.userCompetition.findMany({
      where: { competitionId },
      select: { userId: true, status: true }
    })
    
    console.log(`Found ${registrations.length} raw registrations`)
    
    // Output the first few registrations for debugging
    if (registrations.length > 0) {
      console.log('First registration:', JSON.stringify(registrations[0]))
    }
    
    // Get all user IDs
    const registeredUserIds = registrations.map(reg => reg.userId)
    console.log(`Extracted ${registeredUserIds.length} user IDs`)
    
    // If no registered users, return empty array early
    if (registeredUserIds.length === 0) {
      return NextResponse.json({ 
        players: [],
        debug: {
          message: "No registered users found for this competition",
          competitionId,
          userCompCount
        }
      })
    }
    
    // Get all users that match the IDs, regardless of other filters first
    const userCount = await db.user.count({
      where: { id: { in: registeredUserIds } }
    })
    
    console.log(`Found ${userCount} matching users out of ${registeredUserIds.length} user IDs`)
    
    // Simple query for all registered users if no filters
    let where: any = {
      id: { in: registeredUserIds }
    }
    
    // Build search conditions if query provided
    const searchCondition = query ? {
      OR: [
        { name: { contains: query, mode: Prisma.QueryMode.insensitive } },
        { email: { contains: query, mode: Prisma.QueryMode.insensitive } }
      ]
    } : null
    
    // When unassignedOnly is false, we want to show ALL registered users
    // We only need to add the teamCondition filter when unassignedOnly is true
    const teamCondition = unassignedOnly ? {
      OR: [
        { teamId: null },
        { 
          team: { 
            is: null 
          } 
        },
        {
          team: {
            competitionId: {
              not: competitionId
            }
          }
        }
      ]
    } : null
    
    console.log(`Team filter condition: ${teamCondition ? 'applied' : 'not applied'}`);
    
    // Combine conditions with AND if needed
    if (searchCondition && teamCondition) {
      // Both search and team filter
      where = {
        AND: [
          { id: { in: registeredUserIds } },
          searchCondition,
          teamCondition
        ]
      }
    } else if (searchCondition) {
      // Only search
      where = {
        AND: [
          { id: { in: registeredUserIds } },
          searchCondition
        ]
      }
    } else if (teamCondition) {
      // Only team filter
      where = {
        AND: [
          { id: { in: registeredUserIds } },
          teamCondition
        ]
      }
    } else {
      // No filters - just registered users
      where = { id: { in: registeredUserIds } }
    }
    
    console.log('Final query where clause:', JSON.stringify(where))
    
    // Get the users with their team info
    const players = await db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        position: true,
        proficiencyScore: true,
        teamId: true,
        team: {
          select: {
            id: true,
            name: true,
            competitionId: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })
    
    console.log(`Returning ${players.length} players`)
    
    // For debugging: check the first few users to see their team assignments
    if (players.length > 0) {
      const firstPlayers = players.slice(0, Math.min(3, players.length));
      console.log('Sample players:', firstPlayers.map(p => ({
        id: p.id,
        name: p.name,
        hasTeam: p.teamId !== null,
        teamId: p.teamId,
        teamName: p.team?.name
      })));
    }
    
    // Count users with/without teams for debugging
    const assignedUsersCount = players.filter(p => p.teamId !== null).length;
    const unassignedUsersCount = players.length - assignedUsersCount;
    
    return NextResponse.json({
      players,
      debug: {
        registeredCount: registeredUserIds.length,
        returnedCount: players.length,
        userMatchCount: userCount,
        userCompCount,
        assignedCount: assignedUsersCount,
        unassignedCount: unassignedUsersCount,
        filters: {
          searchQuery: query,
          unassignedOnly
        }
      }
    })
  } catch (error) {
    console.error('Error fetching registered players:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registered players', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
} 