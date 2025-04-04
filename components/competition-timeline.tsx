"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, CheckCircle, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

export function CompetitionTimeline() {
  const { data: session } = useSession()
  const user = session?.user
  const [deadlines, setDeadlines] = useState<
    {
      id: string
      title: string
      date: string
      status: "completed" | "active" | "upcoming"
      description: string
    }[]
  >([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, fetch from API
    // For now, use mock data
    const mockDeadlines = [
      {
        id: "deadline1",
        title: "Player Registration",
        date: "2025-05-15",
        status: "completed" as const,
        description: "Deadline for players to register for the competition",
      },
      {
        id: "deadline2",
        title: "Team Formation",
        date: "2025-05-30",
        status: "completed" as const,
        description: "Teams are formed and players are assigned",
      },
      {
        id: "deadline3",
        title: "Captain Voting",
        date: "2025-06-05",
        status: "completed" as const,
        description: "Team members vote for their captains",
      },
      {
        id: "deadline4",
        title: "Game Selection",
        date: "2025-06-10",
        status: "active" as const,
        description: "Teams select which games they will participate in",
      },
      {
        id: "deadline5",
        title: "Competition Start",
        date: "2025-06-15",
        status: "upcoming" as const,
        description: "Official start of the competition games",
      },
      {
        id: "deadline6",
        title: "Competition End",
        date: "2025-07-15",
        status: "upcoming" as const,
        description: "Final day of competition games",
      },
      {
        id: "deadline7",
        title: "Awards Ceremony",
        date: "2025-07-20",
        status: "upcoming" as const,
        description: "Recognition of teams and players",
      },
    ]

    setDeadlines(mockDeadlines)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Competition Timeline</CardTitle>
          <CardDescription>Loading timeline...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 bg-muted rounded-md"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Only show the admin edit button for admins
  const isAdmin = user?.role === "admin"

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Competition Timeline</CardTitle>
          <CardDescription>Key dates and deadlines for the 2025 Eid-Al-Athletes competition</CardDescription>
        </div>
        {isAdmin && (
          <div>
            <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
              Edit Timeline
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-border"></div>

          <div className="space-y-6">
            {deadlines.map((deadline, index) => (
              <div key={deadline.id} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-background border flex items-center justify-center z-10">
                  {deadline.status === "completed" ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : deadline.status === "active" ? (
                    <Clock className="h-6 w-6 text-amber-500" />
                  ) : (
                    <CalendarDays className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 pt-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium">{deadline.title}</h3>
                    <Badge
                      variant={
                        deadline.status === "completed"
                          ? "outline"
                          : deadline.status === "active"
                            ? "default"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {deadline.status === "completed"
                        ? "Completed"
                        : deadline.status === "active"
                          ? "Active"
                          : "Upcoming"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{deadline.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(deadline.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

