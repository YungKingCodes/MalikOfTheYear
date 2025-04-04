"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Users, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Game {
  id: string
  name: string
  date: string
  type: string
  status: string
  location: string
  opponent: string
  playersAssigned: number
  maxPlayers: number
  requiresAllPlayers: boolean
}

export function CaptainGameAssignments() {
  const router = useRouter()
  const [upcomingGames, setUpcomingGames] = useState<Game[]>([
    {
      id: "game1",
      name: "Basketball Tournament",
      date: "2025-06-15T14:00:00Z",
      type: "Team Sport",
      status: "scheduled",
      location: "Main Arena",
      opponent: "Royal Rams",
      playersAssigned: 3,
      maxPlayers: 5,
      requiresAllPlayers: false,
    },
    {
      id: "game2",
      name: "Soccer Match",
      date: "2025-06-18T15:30:00Z",
      type: "Team Sport",
      status: "scheduled",
      location: "Field",
      opponent: "Athletic Antelopes",
      playersAssigned: 0,
      maxPlayers: 11,
      requiresAllPlayers: false,
    },
    {
      id: "game3",
      name: "Volleyball Tournament",
      date: "2025-06-22T13:00:00Z",
      type: "Team Sport",
      status: "scheduled",
      location: "Court",
      opponent: "Speed Sheep",
      playersAssigned: 6,
      maxPlayers: 6,
      requiresAllPlayers: true,
    },
    {
      id: "game4",
      name: "Relay Race",
      date: "2025-06-25T10:00:00Z",
      type: "Relay",
      status: "scheduled",
      location: "Track",
      opponent: "All Teams",
      playersAssigned: 0,
      maxPlayers: 4,
      requiresAllPlayers: false,
    },
  ])

  const handleAssignPlayers = (gameId: string) => {
    router.push(`/games/${gameId}#player-assignment`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Player Assignments</CardTitle>
        <CardDescription>Assign players to upcoming games for your team</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingGames.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No upcoming games found that need player assignments.
            </div>
          ) : (
            upcomingGames.map((game) => (
              <div key={game.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-secondary">{game.type}</Badge>
                      <Badge variant="outline">
                        {new Date(game.date).toLocaleDateString()} at{" "}
                        {new Date(game.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-lg">{game.name}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        <span>{game.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>vs {game.opponent}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <div className="text-sm">
                      <span className="font-medium">Players Assigned:</span>{" "}
                      <span className={game.playersAssigned === 0 ? "text-red-500" : ""}>
                        {game.playersAssigned}/{game.requiresAllPlayers ? "All" : game.maxPlayers}
                      </span>
                    </div>
                    <Button
                      asChild
                      variant={game.playersAssigned === 0 ? "default" : "outline"}
                      className={game.playersAssigned === 0 ? "bg-primary" : ""}
                    >
                      <Link href={`/games/${game.id}`}>
                        {game.playersAssigned === 0 ? "Assign Players" : "Manage Assignments"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

