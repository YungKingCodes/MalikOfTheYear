"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Users, Activity, Crown, Medal, Star } from "lucide-react"
import { getUserTeam } from "@/app/actions/teams"
import { useToast } from "@/components/ui/use-toast"

interface TeamMember {
  id: string
  name: string | null
  email: string | null
  image: string | null
  gamesPlayed: number
  isActive: boolean
}

interface TeamData {
  id: string
  name: string
  score: number
  maxScore: number
  winRate: number
  captain: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  } | null
  members: TeamMember[]
}

export function MyTeamTab() {
  const [teamData, setTeamData] = useState<TeamData | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadTeamData() {
      try {
        setLoading(true)
        const data = await getUserTeam()
        setTeamData(data)
      } catch (error) {
        console.error("Error loading team data:", error)
        toast({
          title: "Error",
          description: "Failed to load team data. Please try again later.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    loadTeamData()
  }, [toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!teamData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="bg-muted rounded-full p-6 mb-4">
          <Users className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Team Found</h3>
        <p className="text-muted-foreground mb-4">
          You are not currently assigned to any team.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Team Stats Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamData.score}</div>
            <p className="text-xs text-muted-foreground">Total team points</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamData.winRate}%</div>
            <p className="text-xs text-muted-foreground">Team performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamData.members.length}/8</div>
            <p className="text-xs text-muted-foreground">Total members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Captain</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium truncate">
              {teamData.captain?.name || "No Captain"}
            </div>
            <p className="text-xs text-muted-foreground">Team leader</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>View your team's roster and individual stats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-5 p-4 font-medium">
              <div>Player</div>
              <div>Role</div>
              <div>Games</div>
              <div>Status</div>
              <div>Performance</div>
            </div>
            <div className="divide-y">
              {teamData.members.map((member) => (
                <div key={member.id} className="grid grid-cols-5 p-4 items-center">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={member.image || `/placeholder.svg?height=32&width=32&text=${member.name?.substring(0, 2) || 'NA'}`}
                        alt={member.name || "Team Member"}
                      />
                      <AvatarFallback>{member.name?.substring(0, 2) || 'NA'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.name || "Unnamed Member"}</p>
                      <p className="text-xs text-muted-foreground">{member.email || "No email"}</p>
                    </div>
                  </div>
                  <div className="text-sm">
                    {member.id === teamData.captain?.id ? (
                      <Badge variant="default" className="text-xs">Captain</Badge>
                    ) : (
                      <span className="text-muted-foreground">Player</span>
                    )}
                  </div>
                  <div className="text-sm">{member.gamesPlayed}</div>
                  <div>
                    <Badge variant={member.isActive ? "default" : "secondary"} className="text-xs">
                      {member.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="text-sm">
                    <Progress value={member.gamesPlayed * 10} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 