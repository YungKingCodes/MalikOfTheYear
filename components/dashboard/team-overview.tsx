"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Lock } from "lucide-react"
import { useEffect, useState } from "react"
import { getTeamById, getUsers } from "@/lib/data"
import { useSession } from "next-auth/react"
import { canViewPlayerScores } from "@/lib/auth-utils"

interface TeamMember {
  _id: string
  name: string
  proficiencyScore: number
}

interface Team {
  _id: string
  name: string
  score: number
  maxScore: number
  captain: string
  winRate: number
  members: string[]
}

export function TeamOverview() {
  const { data: session } = useSession()
  const user = session?.user
  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // For demo purposes, we'll use team1 (Mountain Goats)
  const teamId = "team1"

  useEffect(() => {
    async function loadTeamData() {
      try {
        setLoading(true)

        // Get team details
        const teamData = await getTeamById(teamId)
        setTeam(teamData)

        // Get team members
        const teamMembers = await getUsers({ teamId })
        setMembers(teamMembers.slice(0, 4)) // Just show first 4 members

        setError(null)
      } catch (err) {
        console.error("Failed to load team data:", err)
        setError("Failed to load team data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadTeamData()
  }, [teamId])

  if (loading) {
    return <div className="py-4 text-center text-muted-foreground">Loading team overview...</div>
  }

  if (error) {
    return <div className="py-4 text-center text-destructive">{error}</div>
  }

  if (!team) {
    return <div className="py-4 text-center text-muted-foreground">Team not found.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src="/placeholder.svg?height=64&width=64" alt="Team logo" />
          <AvatarFallback>MG</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-semibold">{team.name}</h3>
          <p className="text-sm text-muted-foreground">Captain: Sarah Johnson</p>
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
            <p className="text-sm font-medium">Games Won</p>
            <p className="text-sm font-medium">8 / 10</p>
          </div>
          <Progress value={80} />
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
          {members.map((member) => (
            <div key={member._id} className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={`/placeholder.svg?height=32&width=32&text=${member.name.substring(0, 2)}`}
                  alt={member.name}
                />
                <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{member.name}</p>
                <p className="text-xs text-muted-foreground">
                  Score:{" "}
                  {canViewPlayerScores(user, teamId) ? (
                    member.proficiencyScore
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

