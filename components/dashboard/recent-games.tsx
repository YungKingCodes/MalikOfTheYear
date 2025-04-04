"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CalendarDays } from "lucide-react"
import { useEffect, useState } from "react"
import { getRecentGames } from "@/lib/data"

interface Game {
  _id: string
  name: string
  date: string
  team1: string
  team2: string
  score1?: number
  score2?: number
  status: string
}

export function RecentGames() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [teamNames, setTeamNames] = useState<Record<string, string>>({})

  useEffect(() => {
    async function loadGames() {
      try {
        setLoading(true)
        const recentGames = await getRecentGames()

        // Create a map of team IDs to team names
        const teamMap: Record<string, string> = {}
        recentGames.forEach((game: Game) => {
          // In a real implementation, we would fetch team names from the API
          // For now, we'll use placeholder names based on the team ID
          teamMap[game.team1] =
            game.team1 === "team1"
              ? "Mountain Goats"
              : game.team1 === "team2"
                ? "Royal Rams"
                : game.team1 === "team3"
                  ? "Athletic Antelopes"
                  : game.team1 === "team4"
                    ? "Speed Sheep"
                    : game.team1

          teamMap[game.team2] =
            game.team2 === "team1"
              ? "Mountain Goats"
              : game.team2 === "team2"
                ? "Royal Rams"
                : game.team2 === "team3"
                  ? "Athletic Antelopes"
                  : game.team2 === "team4"
                    ? "Speed Sheep"
                    : game.team2
        })

        setTeamNames(teamMap)
        setGames(recentGames)
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
    return <div className="py-4 text-center text-muted-foreground">Loading recent games...</div>
  }

  if (error) {
    return <div className="py-4 text-center text-destructive">{error}</div>
  }

  if (games.length === 0) {
    return <div className="py-4 text-center text-muted-foreground">No recent games found.</div>
  }

  return (
    <div className="space-y-4">
      {games.map((game) => (
        <div key={game._id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
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
              {new Date(game.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={`/placeholder.svg?height=24&width=24&text=${teamNames[game.team1]?.substring(0, 2) || "T1"}`}
                    alt={teamNames[game.team1] || game.team1}
                  />
                  <AvatarFallback>{teamNames[game.team1]?.substring(0, 2) || "T1"}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{teamNames[game.team1] || game.team1}</span>
              </div>
              {game.status === "completed" ? (
                <span className="text-sm font-medium">
                  {game.score1} - {game.score2}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">vs</span>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm">{teamNames[game.team2] || game.team2}</span>
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={`/placeholder.svg?height=24&width=24&text=${teamNames[game.team2]?.substring(0, 2) || "T2"}`}
                    alt={teamNames[game.team2] || game.team2}
                  />
                  <AvatarFallback>{teamNames[game.team2]?.substring(0, 2) || "T2"}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

