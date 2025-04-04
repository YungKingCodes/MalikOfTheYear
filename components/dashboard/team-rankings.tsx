"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"
import { getTeams } from "@/lib/data"

interface Team {
  _id: string
  name: string
  score: number
  maxScore: number
  captain: string
  winRate: number
}

export function TeamRankings() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTeams() {
      try {
        setLoading(true)
        const activeCompetitionTeams = await getTeams()
        setTeams(activeCompetitionTeams)
        setError(null)
      } catch (err) {
        console.error("Failed to load teams:", err)
        setError("Failed to load teams. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadTeams()
  }, [])

  if (loading) {
    return <div className="py-4 text-center text-muted-foreground">Loading team rankings...</div>
  }

  if (error) {
    return <div className="py-4 text-center text-destructive">{error}</div>
  }

  if (teams.length === 0) {
    return <div className="py-4 text-center text-muted-foreground">No teams found.</div>
  }

  return (
    <div className="space-y-6">
      {teams.map((team, index) => (
        <div key={team._id} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {index + 1}
              </div>
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={`/placeholder.svg?height=32&width=32&text=${team.name.substring(0, 2)}`}
                  alt={team.name}
                />
                <AvatarFallback>{team.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{team.name}</p>
                <p className="text-xs text-muted-foreground">Captain: {team.captain}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{team.score} pts</p>
              <p className="text-xs text-muted-foreground">{team.winRate}% win rate</p>
            </div>
          </div>
          <Progress value={(team.score / team.maxScore) * 100} className="h-2" />
        </div>
      ))}
    </div>
  )
}

