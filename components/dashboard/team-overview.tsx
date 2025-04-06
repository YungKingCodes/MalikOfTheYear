"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Lock } from "lucide-react"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { canViewPlayerScores } from "@/lib/auth-utils"
import { Skeleton } from "@/components/ui/skeleton"
import { getTeamData } from "@/app/actions/dashboard-stats"

interface TeamMember {
  id: string
  name: string | null
  proficiencyScore: number | null
  image?: string | null
}

interface Team {
  id: string
  name: string
  score: number
  maxScore: number
  captain: {
    id: string
    name: string | null
    image: string | null
  } | null
  winRate: number
  members: TeamMember[]
}

export function TeamOverview() {
  const { data: session } = useSession()
  const user = session?.user
  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch user's team or first team if user doesn't have one
  useEffect(() => {
    async function loadTeamData() {
      try {
        setLoading(true)

        const teamData = await getTeamData()
        setTeam(teamData)
        setError(null)
      } catch (err) {
        console.error("Failed to load team data:", err)
        setError("Failed to load team data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadTeamData()
  }, [user?.teamId])

  if (loading) {
    return <TeamOverviewSkeleton />
  }

  if (error) {
    return <div className="py-4 text-center text-destructive">{error}</div>
  }

  if (!team) {
    return <div className="py-4 text-center text-muted-foreground">Team not found.</div>
  }

  // Handle special case for no teams available
  if (team.id === "no-teams") {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No teams are available in the system.</p>
        <p className="text-sm text-muted-foreground mt-1">Teams will appear here once they are created.</p>
      </div>
    )
  }

  // Handle special case for team data unavailable due to error
  if (team.id === "error") {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">Team data is temporarily unavailable.</p>
        <p className="text-sm text-muted-foreground mt-1">Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src="/placeholder.svg?height=64&width=64" alt="Team logo" />
          <AvatarFallback>{team.name.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-semibold">{team.name}</h3>
          <p className="text-sm text-muted-foreground">
            Captain: {team.captain?.name || "No Captain"}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Team Score</p>
            <p className="text-sm font-medium">
              {team.score} / {team.maxScore}
            </p>
          </div>
          <Progress value={(team.score / team.maxScore) * 100} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Win Rate</p>
            <p className="text-sm font-medium">{team.winRate}%</p>
          </div>
          <Progress value={team.winRate} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Player Participation</p>
            <p className="text-sm font-medium">95%</p>
          </div>
          <Progress value={95} />
        </div>
      </div>

      <div className="pt-4">
        <h4 className="text-sm font-semibold mb-3">Team Members</h4>
        <div className="space-y-3">
          {team.members.slice(0, 4).map((member) => (
            <div key={member.id} className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={member.image || `/placeholder.svg?height=32&width=32&text=${member.name?.substring(0, 2) || 'NA'}`}
                  alt={member.name || "Team Member"}
                />
                <AvatarFallback>{member.name?.substring(0, 2) || 'NA'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{member.name || "Unnamed Member"}</p>
                <p className="text-xs text-muted-foreground">
                  Score:{" "}
                  {canViewPlayerScores(user, team.id) ? (
                    member.proficiencyScore || 0
                  ) : (
                    <span className="flex items-center">
                      <Lock className="h-3 w-3 mr-1" />
                      Hidden
                    </span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TeamOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </div>
      
      <div className="pt-4">
        <Skeleton className="h-5 w-24 mb-3" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-4 w-full max-w-[120px]" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

