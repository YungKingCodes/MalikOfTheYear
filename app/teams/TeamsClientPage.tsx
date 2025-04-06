"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Filter, Trophy, Users, BarChart3, Crown } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useSession } from "next-auth/react"
import { TeamDetailsModal } from "@/components/modals/team-details-modal"
import { getAllTeams, getIncompleteTeams, getTeamsInCaptainVoting } from "@/app/actions/teams"
import { CreateTeamDialog } from "@/components/dashboard/teams-tab"
import { LoadingSpinner } from "@/components/loading-skeletons/competition-detail-skeleton"

interface TeamMember {
  id: string
  name: string | null
  image: string | null
}

interface Team {
  _id: string
  name: string
  score: number
  captain: string
  captainId?: string | null
  members: (TeamMember | undefined)[] | null | undefined
  winRate?: number
  votesCast?: number
  totalMembers?: number
  status?: string
  votingPercentage?: number
  neededPlayers?: number
  maxScore?: number
}

export default function TeamsClientPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [incompleteTeams, setIncompleteTeams] = useState<Team[]>([])
  const [teamsInVoting, setTeamsInVoting] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()
  const user = session?.user

  // For team details modal
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [teamDetailsOpen, setTeamDetailsOpen] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [teamsData, incompleteTeamsData, votingTeamsData] = await Promise.all([
          getAllTeams(),
          getIncompleteTeams(),
          getTeamsInCaptainVoting(),
        ])

        // Type assertion to make TypeScript happy
        const typedTeams = teamsData as Team[] || []
        const typedIncompleteTeams = incompleteTeamsData as Team[] || []
        const typedVotingTeams = votingTeamsData as Team[] || []

        setTeams(typedTeams)
        setIncompleteTeams(typedIncompleteTeams)
        setTeamsInVoting(typedVotingTeams)
        setError(null)
      } catch (err) {
        console.error("Failed to load teams data:", err)
        // Don't set an error message for empty teams, just set empty arrays
        setTeams([])
        setIncompleteTeams([])
        setTeamsInVoting([])
        // Only set error for actual errors, not for empty data
        setError(null)
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

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground">Manage teams, captains, and team members</p>
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

      {teams.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {teams.slice(0, 4).map((team, index) => (
            <TeamCard key={team._id} team={team} rank={index + 1} onView={handleViewTeam} />
          ))}
        </div>
      ) : (
        <EmptyStateMessage 
          title="No Teams Found" 
          description="There are no teams set up for the current competition yet." 
        />
      )}

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="flex w-full overflow-x-auto">
          <TabsTrigger value="all">All Teams</TabsTrigger>
          <TabsTrigger value="incomplete">Incomplete Teams</TabsTrigger>
          <TabsTrigger value="captain-vote">Captain Voting</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Roster</CardTitle>
              <CardDescription>All teams participating in the 2025 competition</CardDescription>
            </CardHeader>
            <CardContent>
              {teams.length > 0 ? (
                <div className="space-y-8">
                  {/* Desktop view */}
                  <div className="hidden md:block rounded-md border">
                    <div className="grid grid-cols-6 p-4 font-medium">
                      <div>Team</div>
                      <div>Captain</div>
                      <div>Members</div>
                      <div>Score</div>
                      <div>Rank</div>
                      <div className="text-right">Actions</div>
                    </div>
                    <div className="divide-y">
                      {teams.map((team, index) => (
                        <div key={team._id} className="grid grid-cols-6 p-4 items-center">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={`/placeholder.svg?height=32&width=32&text=${team.name.substring(0, 2)}`}
                                alt={team.name}
                              />
                              <AvatarFallback>{team.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{team.name}</p>
                            </div>
                          </div>
                          <div className="text-sm">{team.captain}</div>
                          <div className="text-sm">{team.members ? team.members.length : 0}/8</div>
                          <div className="text-sm">{team.score}</div>
                          <div>
                            <Badge variant={index < 3 ? "default" : "outline"} className="text-xs">
                              #{index + 1}
                            </Badge>
                          </div>
                          <div className="flex justify-end gap-2">
                            <ActionButtons teamId={team._id} onView={handleViewTeam} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mobile view */}
                  <div className="md:hidden space-y-4">
                    {teams.map((team, index) => (
                      <div key={team._id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={`/placeholder.svg?height=40&width=40&text=${team.name.substring(0, 2)}`}
                                alt={team.name}
                              />
                              <AvatarFallback>{team.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{team.name}</p>
                              <p className="text-sm text-muted-foreground">Captain: {team.captain}</p>
                            </div>
                          </div>
                          <Badge variant={index < 3 ? "default" : "outline"} className="text-xs">
                            #{index + 1}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-y-2 mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Members</p>
                            <p className="text-sm">{team.members ? team.members.length : 0}/8</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Score</p>
                            <p className="text-sm">{team.score}</p>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <ActionButtons teamId={team._id} onView={handleViewTeam} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyStateMessage 
                  title="No Teams Available" 
                  description="No teams have been created for the current competition yet." 
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incomplete" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Incomplete Teams</CardTitle>
              <CardDescription>Teams that need additional members</CardDescription>
            </CardHeader>
            <CardContent>
              {incompleteTeams.length > 0 ? (
                <div className="space-y-8">
                  {/* Desktop view */}
                  <div className="hidden md:block rounded-md border">
                    <div className="grid grid-cols-5 p-4 font-medium">
                      <div>Team</div>
                      <div>Captain</div>
                      <div>Members</div>
                      <div>Needed</div>
                      <div className="text-right">Actions</div>
                    </div>
                    <div className="divide-y">
                      {incompleteTeams.map((team) => (
                        <div key={team._id} className="grid grid-cols-5 p-4 items-center">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={`/placeholder.svg?height=32&width=32&text=${team.name.substring(0, 2)}`}
                                alt={team.name}
                              />
                              <AvatarFallback>{team.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{team.name}</p>
                            </div>
                          </div>
                          <div className="text-sm">{team.captain}</div>
                          <div className="text-sm">{team.members ? team.members.length : 0}/8</div>
                          <div className="text-sm">
                            {team.neededPlayers} player{team.neededPlayers !== 1 ? "s" : ""}
                          </div>
                          <div className="flex justify-end gap-2">
                            <IncompleteTeamActions teamId={team._id} onView={handleViewTeam} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mobile view */}
                  <div className="md:hidden space-y-4">
                    {incompleteTeams.map((team) => (
                      <div key={team._id} className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={`/placeholder.svg?height=40&width=40&text=${team.name.substring(0, 2)}`}
                              alt={team.name}
                            />
                            <AvatarFallback>{team.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{team.name}</p>
                            <p className="text-sm text-muted-foreground">Captain: {team.captain}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-y-2 mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Members</p>
                            <p className="text-sm">{team.members ? team.members.length : 0}/8</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Needed</p>
                            <p className="text-sm">
                              {team.neededPlayers} player{team.neededPlayers !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <IncompleteTeamActions teamId={team._id} onView={handleViewTeam} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyStateMessage 
                  title="No Incomplete Teams" 
                  description="All teams are fully staffed or no teams have been created yet." 
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="captain-vote" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Captain Voting</CardTitle>
              <CardDescription>Teams currently in the captain voting process</CardDescription>
            </CardHeader>
            <CardContent>
              {teamsInVoting.length > 0 ? (
                <div className="space-y-8">
                  {/* Desktop view */}
                  <div className="hidden md:block rounded-md border">
                    <div className="grid grid-cols-5 p-4 font-medium">
                      <div>Team</div>
                      <div>Members</div>
                      <div>Votes Cast</div>
                      <div>Status</div>
                      <div className="text-right">Actions</div>
                    </div>
                    <div className="divide-y">
                      {teamsInVoting.map((team, index) => (
                        <div key={team._id} className="grid grid-cols-5 p-4 items-center">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={`/placeholder.svg?height=32&width=32&text=${team.name.substring(0, 2)}`}
                                alt={team.name}
                              />
                              <AvatarFallback>{team.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{team.name}</p>
                            </div>
                          </div>
                          <div className="text-sm">{team.members ? team.members.length : 0}</div>
                          <div className="text-sm">
                            {team.votesCast}/{team.totalMembers}
                          </div>
                          <div>
                            <Badge variant="outline" className="text-xs">
                              {team.status === "in_progress" ? "In Progress" : team.status}
                            </Badge>
                          </div>
                          <div className="flex justify-end gap-2">
                            <CaptainVoteActions teamId={team._id} onView={handleViewTeam} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mobile view */}
                  <div className="md:hidden space-y-4">
                    {teamsInVoting.map((team) => (
                      <div key={team._id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={`/placeholder.svg?height=40&width=40&text=${team.name.substring(0, 2)}`}
                                alt={team.name}
                              />
                              <AvatarFallback>{team.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{team.name}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {team.status === "in_progress" ? "In Progress" : team.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-y-2 mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Members</p>
                            <p className="text-sm">{team.members ? team.members.length : 0}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Votes Cast</p>
                            <p className="text-sm">
                              {team.votesCast}/{team.totalMembers}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <CaptainVoteActions teamId={team._id} onView={handleViewTeam} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyStateMessage 
                  title="No Teams In Voting" 
                  description="There are no teams currently in the captain voting process." 
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Team Details Modal */}
      <TeamDetailsModal teamId={selectedTeamId} open={teamDetailsOpen} onOpenChange={setTeamDetailsOpen} />
    </div>
  )
}

function TeamCard({ team, rank, onView }: { team: Team; rank: number; onView: (teamId: string) => void }) {
  const members = team.members || [];
  const memberCount = Array.isArray(members) ? members.length : 0;
  const maxMembers = 8;

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
          <CardDescription>Captain: {team.captain}</CardDescription>
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
            <Button variant="outline" size="sm" onClick={() => onView(team._id)}>
              View Team
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Update ActionButtons to include onView prop
function ActionButtons({ teamId, onView }: { teamId: string; onView: (teamId: string) => void }) {
  const { data: session } = useSession()
  const user = session?.user
  const isAdmin = user?.role === "admin"
  const isCaptain = user?.role === "captain" && user?.teamId === teamId

  return (
    <>
      {(isAdmin || isCaptain) && (
        <Button variant="ghost" size="sm">
          Edit
        </Button>
      )}
      <Button variant="ghost" size="sm" onClick={() => onView(teamId)}>
        View
      </Button>
    </>
  )
}

// Update IncompleteTeamActions to include onView prop
function IncompleteTeamActions({ teamId, onView }: { teamId: string; onView: (teamId: string) => void }) {
  const { data: session } = useSession()
  const user = session?.user
  const isAdmin = user?.role === "admin"

  return (
    <>
      {isAdmin && (
        <Button variant="outline" size="sm">
          Add Players
        </Button>
      )}
      <Button variant="ghost" size="sm" onClick={() => onView(teamId)}>
        View
      </Button>
    </>
  )
}

// Update CaptainVoteActions to include onView prop
function CaptainVoteActions({ teamId, onView }: { teamId: string; onView: (teamId: string) => void }) {
  const { data: session } = useSession()
  const user = session?.user
  const isAdmin = user?.role === "admin"
  const isTeamMember = user?.teamId === teamId

  return (
    <>
      {(isAdmin || isTeamMember) && (
        <Button variant="outline" size="sm">
          View Votes
        </Button>
      )}
      {isAdmin && (
        <Button variant="ghost" size="sm">
          Remind
        </Button>
      )}
      <Button variant="ghost" size="sm" onClick={() => onView(teamId)}>
        View
      </Button>
    </>
  )
}

