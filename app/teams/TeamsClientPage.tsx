"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Filter, Trophy, Users, BarChart3, Crown, ChevronDown, ChevronRight } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useSession } from "next-auth/react"
import { TeamDetailsModal } from "@/components/modals/team-details-modal"
import { getAllTeams, getIncompleteTeams, getTeamsInCaptainVoting } from "@/app/actions/teams"
import { CreateTeamDialog } from "@/components/dashboard/teams-tab"
import { LoadingSpinner } from "@/components/loading-skeletons/competition-detail-skeleton"
import { getCompetitions } from "@/app/actions/competitions"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface TeamMember {
  id: string
  name: string | null
  image: string | null
}

interface Team {
  id: string
  name: string
  score: number
  maxScore: number
  captainId: string | null
  winRate: number
  memberIds: string[]
  competitionId: string
  createdAt: Date
}

interface Competition {
  id: string
  name: string
  year: number
  status: string
  startDate: string
  endDate: string
  description: string
  teams: Team[]
  winnerId: string | null
  goatId: string | null
  teamIds: string[]
  gameIds: string[]
}

export default function TeamsClientPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openCompetitions, setOpenCompetitions] = useState<Set<string>>(new Set())
  const { data: session } = useSession()
  const user = session?.user

  // For team details modal
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [teamDetailsOpen, setTeamDetailsOpen] = useState(false)

  const toggleCompetition = (competitionId: string) => {
    setOpenCompetitions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(competitionId)) {
        newSet.delete(competitionId)
      } else {
        newSet.add(competitionId)
      }
      return newSet
    })
  }

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const competitionsData = await getCompetitions()
        setCompetitions(competitionsData)
        // Set all competitions to be open by default
        setOpenCompetitions(new Set(competitionsData.map(comp => comp.id)))
        setError(null)
      } catch (err) {
        console.error("Failed to load competitions data:", err)
        setError("Failed to load competitions data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleViewTeam = (teamId: string) => {
    setSelectedTeamId(teamId)
    setTeamDetailsOpen(true)
  }

  if (loading) {
    return <LoadingSpinner text="Loading teams data..." />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground">View teams across all competitions</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search teams..." className="w-full pl-8" />
        </div>
        <Button variant="outline" className="sm:w-auto">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {competitions.length > 0 ? (
        <div className="space-y-4">
          {competitions.map((competition) => (
            <Collapsible
              key={competition.id}
              open={openCompetitions.has(competition.id)}
              onOpenChange={() => toggleCompetition(competition.id)}
              className="border rounded-lg"
            >
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    {openCompetitions.has(competition.id) ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <h2 className="text-xl font-semibold">{competition.name} {competition.year}</h2>
                      <p className="text-sm text-muted-foreground">
                        Status: <Badge variant={competition.status === "active" ? "default" : "outline"}>
                          {competition.status}
                        </Badge>
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {competition.teams.length} team{competition.teams.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 pt-0">
                  {competition.teams.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                      {competition.teams.map((team, index) => (
                        <TeamCard key={team.id} team={team} rank={index + 1} onView={handleViewTeam} />
                      ))}
                    </div>
                  ) : (
                    <EmptyStateMessage 
                      title="No Teams Found" 
                      description={`There are no teams set up for ${competition.name} ${competition.year} yet.`} 
                    />
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      ) : (
        <EmptyStateMessage 
          title="No Competitions Found" 
          description="There are no competitions available at the moment." 
        />
      )}

      {/* Team Details Modal */}
      <TeamDetailsModal teamId={selectedTeamId} open={teamDetailsOpen} onOpenChange={setTeamDetailsOpen} />
    </div>
  )
}

function TeamCard({ team, rank, onView }: { team: { id: string; name: string; score: number; maxScore: number; captainId: string | null; winRate: number; memberIds: string[]; competitionId: string; createdAt: Date }; rank: number; onView: (teamId: string) => void }) {
  const members = team.memberIds.map((id) => ({ id, name: null, image: null }))
  const memberCount = members.length
  const maxMembers = 8

  // Choose icon based on rank
  const getIcon = () => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-primary" />
      case 2:
        return <Crown className="h-6 w-6 text-primary" />
      case 3:
        return <BarChart3 className="h-6 w-6 text-primary" />
      default:
        return <Users className="h-6 w-6 text-primary" />
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">{getIcon()}</div>
        <div>
          <CardTitle>{team.name}</CardTitle>
          <CardDescription>Captain: {team.captainId}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Team Score</p>
              <p className="text-2xl font-bold">{team.score}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rank</p>
              <p className="text-2xl font-bold">#{rank}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Players</p>
              <p className="text-sm font-medium">
                {memberCount}/{maxMembers}
              </p>
            </div>
            <Progress value={(memberCount / maxMembers) * 100} />
          </div>
          <div className="pt-2 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => onView(team.id)}>
              View Team
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Create empty state component for reuse
const EmptyStateMessage = ({ 
  title, 
  description 
}: { 
  title: string; 
  description: string; 
}) => (
  <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
    <h3 className="text-xl font-medium mb-2">{title}</h3>
    <p className="text-muted-foreground mb-6">{description}</p>
  </div>
);

