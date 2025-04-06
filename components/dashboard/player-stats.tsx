"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Lock } from "lucide-react"
import { useEffect, useState } from "react"
import { getTopPlayers } from "@/lib/data"
import { useSession } from "next-auth/react"
import { canViewPlayerScores } from "@/lib/auth-utils"
import { LoadingSpinner } from "@/components/loading-skeletons/competition-detail-skeleton"

interface Player {
  _id: string
  name: string
  teamId: string
  team?: string
  proficiencyScore: number
  titles: string[]
  position: string
}

export function PlayerStats() {
  const { data: session } = useSession()
  const user = session?.user
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [teamNames, setTeamNames] = useState<Record<string, string>>({})

  useEffect(() => {
    async function loadPlayers() {
      try {
        setLoading(true)
        const topPlayers = await getTopPlayers()

        // Create a map of team IDs to team names
        const teamMap: Record<string, string> = {}
        topPlayers.forEach((player: Player) => {
          // In a real implementation, we would fetch team names from the API
          // For now, we'll use placeholder names based on the team ID
          teamMap[player.teamId] =
            player.teamId === "team1"
              ? "Mountain Goats"
              : player.teamId === "team2"
                ? "Royal Rams"
                : player.teamId === "team3"
                  ? "Athletic Antelopes"
                  : player.teamId === "team4"
                    ? "Speed Sheep"
                    : player.teamId
        })

        setTeamNames(teamMap)
        setPlayers(topPlayers)
        setError(null)
      } catch (err) {
        console.error("Failed to load players:", err)
        setError("Failed to load players. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadPlayers()
  }, [])

  if (loading) {
    return <LoadingSpinner text="Loading top players..." />
  }

  if (error) {
    return <div className="py-4 text-center text-destructive">{error}</div>
  }

  if (players.length === 0) {
    return <div className="py-4 text-center text-muted-foreground">No players found.</div>
  }

  return (
    <div className="space-y-4">
      {players.map((player) => (
        <div key={player._id} className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={`/placeholder.svg?height=40&width=40&text=${player.name.substring(0, 2)}`}
              alt={player.name}
            />
            <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{player.name}</p>
                <p className="text-xs text-muted-foreground">
                  {teamNames[player.teamId] || player.teamId} • {player.position}
                </p>
              </div>
              <div className="text-sm font-medium">
                {canViewPlayerScores(user, player.teamId) ? (
                  player.proficiencyScore
                ) : (
                  <span className="flex items-center text-muted-foreground">
                    <Lock className="h-3 w-3 mr-1" />
                    Hidden
                  </span>
                )}
              </div>
            </div>
            {player.titles && player.titles.length > 0 && (
              <div className="flex gap-2 mt-2">
                {player.titles.map((title) => (
                  <Badge key={title} variant="secondary" className="text-xs">
                    {title}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

