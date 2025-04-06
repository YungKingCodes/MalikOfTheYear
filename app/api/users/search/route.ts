import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  
  // Check if the user is authenticated
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') || ''
    const competitionId = searchParams.get('competitionId')
    const unassignedOnly = searchParams.get('unassignedOnly') === 'true'

    // Create the base query conditions
    const queryConditions: any = {
      OR: [
        {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ],
    }
    
    // If filtering by competition registration
    if (competitionId) {
      // If looking for registered users for a competition
      // Get users registered for the competition
      const registeredUsers = await db.userCompetition.findMany({
        where: {
          competitionId,
          status: 'registered',
        },
        select: {
          userId: true,
        },
      })
      
      const registeredUserIds = registeredUsers.map(u => u.userId)
      
      // Add the registered user IDs to the query
      queryConditions.id = {
        in: registeredUserIds,
      }
      
      // If only looking for unassigned users (no team yet)
      if (unassignedOnly) {
        queryConditions.OR = [
          { teamId: null }, // User has no team
          {
            team: {
              NOT: {
                competitionId,
              },
            }, // User's team is not in this competition
          },
        ]
      }
    }

    // Perform the search
    const users = await db.user.findMany({
      where: queryConditions,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        teamId: true,
        team: {
          select: {
            id: true,
            name: true,
            competitionId: true,
          },
        },
      },
      take: 10, // Limit search results
    })

    return NextResponse.json({
      users,
    })
  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    )
  }
} 