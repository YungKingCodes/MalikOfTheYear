"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CalendarDays } from "lucide-react"
import { useEffect, useState } from "react"
import { getGamesForDashboard } from "@/app/actions/dashboard-stats"
import { Skeleton } from "@/components/ui/skeleton"

interface GameParticipant {
  id: string
  gameId: string
  teamId: string
  score?: number | null
  rank?: number | null
  status: string
  team: {
    id: string
    name: string
  }
}

interface Game {
  id: string
  name: string
  description: string
  type: string
  status: string
  date?: Date | null
  participants: GameParticipant[]
}

interface DashboardGames {
  upcomingGames: Game[]
  recentGames: Game[]
}

export function RecentGames() {
  const [gamesData, setGamesData] = useState<DashboardGames>({ upcomingGames: [], recentGames: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadGames() {
      try {
        setLoading(true)
        const games = await getGamesForDashboard()
        setGamesData(games)
        setError(null)
      } catch (err) {
        console.error("Failed to load games:", err)
        setError("Failed to load games. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadGames()
  }, [])

  if (loading) {
    return <RecentGamesSkeleton />
  }

  if (error) {
    return <div className="py-4 text-center text-destructive">{error}</div>
  }

  if (gamesData.recentGames.length === 0) {
    return <div className="py-4 text-center text-muted-foreground">No recent games found.</div>
  }

  return (
    <div className="space-y-4">
      {gamesData.recentGames.map((game) => {
        // Find the participating teams (should be 2 in most cases)
        const participants = game.participants || []
        const team1 = participants[0]?.team
        const team2 = participants[1]?.team
        
        return (
          <div key={game.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{game.name}</p>
                <Badge variant={game.status === "completed" ? "default" : "outline"}>
                  {game.status === "completed" ? "Completed" : "Upcoming"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {game.date ? new Date(game.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Date TBD"}
              </p>
              {team1 && team2 && (
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={`/placeholder.svg?height=24&width=24&text=${team1.name.substring(0, 2)}`}
                        alt={team1.name}
                      />
                      <AvatarFallback>{team1.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{team1.name}</span>
                  </div>
                  {game.status === "completed" ? (
                    <span className="text-sm font-medium">
                      {participants[0]?.score} - {participants[1]?.score}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">vs</span>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{team2.name}</span>
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={`/placeholder.svg?height=24&width=24&text=${team2.name.substring(0, 2)}`}
                        alt={team2.name}
                      />
                      <AvatarFallback>{team2.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function RecentGamesSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-3 w-32" />
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-4 w-8" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

