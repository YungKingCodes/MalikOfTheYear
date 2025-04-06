"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MapPin } from "lucide-react"
import { useEffect, useState } from "react"
import { getGamesForDashboard } from "@/app/actions/dashboard-stats"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"

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
  location?: string | null
  participants: GameParticipant[]
}

interface DashboardGames {
  upcomingGames: Game[]
  recentGames: Game[]
}

export function UpcomingGames() {
  const [gamesData, setGamesData] = useState<DashboardGames>({ upcomingGames: [], recentGames: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

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

  const handleViewGame = (gameId: string) => {
    router.push(`/games/${gameId}`)
  }

  if (loading) {
    return <UpcomingGamesSkeleton />
  }

  if (error) {
    return <div className="py-4 text-center text-destructive">{error}</div>
  }

  if (gamesData.upcomingGames.length === 0) {
    return <div className="py-4 text-center text-muted-foreground">No upcoming games found.</div>
  }

  return (
    <div className="space-y-4">
      {gamesData.upcomingGames.map((game) => {
        // Find the participating teams (should be 2 in most cases)
        const participants = game.participants || []
        const team1 = participants[0]?.team
        const team2 = participants[1]?.team
        const gameDate = game.date ? new Date(game.date) : null
        
        return (
          <div key={game.id} className="p-4 rounded-lg border hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{game.name}</h3>
              <Badge variant="outline" className="text-xs">
                {gameDate ? getRelativeDateLabel(gameDate) : "Date TBD"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {gameDate ? gameDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
              }) : "Date to be determined"}{" "}
              {gameDate ? `at ${gameDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ""}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm mb-3">
              {game.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs">{game.location}</span>
                </div>
              )}
              {team1 && team2 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">Teams:</span>
                  <div className="flex items-center">
                    <Avatar className="h-5 w-5 mr-1">
                      <AvatarImage
                        src={`/placeholder.svg?height=20&width=20&text=${team1.name.substring(0, 2)}`}
                        alt={team1.name}
                      />
                      <AvatarFallback>{team1.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs">{team1.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">vs</span>
                  <div className="flex items-center">
                    <Avatar className="h-5 w-5 mr-1">
                      <AvatarImage
                        src={`/placeholder.svg?height=20&width=20&text=${team2.name.substring(0, 2)}`}
                        alt={team2.name}
                      />
                      <AvatarFallback>{team2.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs">{team2.name}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => handleViewGame(game.id)}>
                View Details
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function UpcomingGamesSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-3 w-48 mb-3" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
            <Skeleton className="h-4 w-24" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-6" />
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}

function getRelativeDateLabel(date: Date): string {
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Tomorrow"
  if (diffDays < 7) return `In ${diffDays} days`
  if (diffDays < 14) return "Next week"
  if (diffDays < 30) return `In ${Math.floor(diffDays / 7)} weeks`
  
  return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
} 