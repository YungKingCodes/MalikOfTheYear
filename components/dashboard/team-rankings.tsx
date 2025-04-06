"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"
import { getTeamRankings } from "@/app/actions/dashboard-stats"

interface RankedTeam {
  id: string
  name: string
  score: number
  maxScore: number
  rank: number
  winRate: number
  captainName: string
  captain?: {
    name: string | null
    image: string | null
  } | null
}

interface TeamRankingsData {
  teams: RankedTeam[]
}

export function TeamRankings() {
  const [teamsData, setTeamsData] = useState<TeamRankingsData>({ teams: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTeams() {
      try {
        setLoading(true)
        const data = await getTeamRankings()
        setTeamsData(data)
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
    return <TeamRankingsSkeleton />
  }

  if (error) {
    return <div className="py-4 text-center text-destructive">{error}</div>
  }

  if (teamsData.teams.length === 0) {
    return <div className="py-4 text-center text-muted-foreground">No teams found.</div>
  }

  return (
    <div className="space-y-6">
      {teamsData.teams.map((team) => (
        <div key={team.id} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {team.rank}
              </div>
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={team.captain?.image || `/placeholder.svg?height=32&width=32&text=${team.name.substring(0, 2)}`}
                  alt={team.name}
                />
                <AvatarFallback>{team.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{team.name}</p>
                <p className="text-xs text-muted-foreground">Captain: {team.captainName}</p>
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

function TeamRankingsSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="text-right space-y-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
      ))}
    </div>
  )
}

