"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Filter } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useSession } from "next-auth/react"
import { getAllTeams, getIncompleteTeams, getTeamsInCaptainVoting } from "@/app/actions/teams"
import { useToast } from "@/components/ui/use-toast"
import { LoadingSpinner } from "@/components/loading-skeletons/competition-detail-skeleton"

interface Team {
  _id: string
  name: string
  score: number
  maxScore: number
  captain: string
  captainId?: string | null
  winRate: number
  members: Array<{
    id: string
    name: string | null
    image: string | null
  } | undefined> | null | undefined
}

export function TeamsTab() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [votingTeams, setVotingTeams] = useState<any[]>([])
  const [votingTeamsLoading, setVotingTeamsLoading] = useState(true)
  const [votingTeamsError, setVotingTeamsError] = useState<string | null>(null)
  const { data: session } = useSession()
  const user = session?.user
  const isAdmin = user?.role === "admin"
  const { toast } = useToast()

  // Error handling utility
  const handleAsyncError = (err: any, errorSetter: React.Dispatch<React.SetStateAction<string | null>>, defaultMessage: string) => {
    console.error(defaultMessage, err);
    errorSetter(err instanceof Error ? err.message : defaultMessage);
  };

  const loadTeams = async () => {
    try {
      setLoading(true)
      const teamsData = await getAllTeams()
      if (Array.isArray(teamsData)) {
        const typedTeams = teamsData.map(team => ({
          ...team,
          members: team.members || []
        }))
        setTeams(typedTeams)
        setError(null)
      } else {
        setTeams([])
        setError("Invalid data format received from server")
        console.error("Invalid teams data format:", teamsData)
      }
    } catch (err) {
      handleAsyncError(err, setError, "Failed to load teams. Please try again later.")
      setTeams([])
    } finally {
      setLoading(false)
    }
  }

  const loadVotingTeams = async () => {
    try {
      setVotingTeamsLoading(true)
      const votingTeamsData = await getTeamsInCaptainVoting()
      if (Array.isArray(votingTeamsData)) {
        setVotingTeams(votingTeamsData)
        setVotingTeamsError(null)
      } else {
        setVotingTeams([])
        setVotingTeamsError("Invalid data format for voting teams")
        console.error("Invalid voting teams data format:", votingTeamsData)
      }
    } catch (err) {
      handleAsyncError(err, setVotingTeamsError, "Failed to load teams in voting")
      setVotingTeams([])
    } finally {
      setVotingTeamsLoading(false)
    }
  }

  useEffect(() => {
    // Load data independently to prevent one failure affecting the other
    loadTeams()
    loadVotingTeams()
  }, [])

  if (loading) {
    return <LoadingSpinner text="Loading teams..." />
  }

  if (error) {
    return <div className="py-4 text-center text-destructive">{error}</div>
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Teams</h2>
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {teams.map((team) => (
          <TeamCard key={team._id} team={team} isAdmin={isAdmin} teams={teams} />
        ))}
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
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
              <div className="space-y-8">
                <div className="rounded-md border overflow-x-auto">
                  <div className="min-w-[800px]">
                    <div className="grid grid-cols-6 p-4 font-medium">
                      <div>Team</div>
                      <div>Captain</div>
                      <div>Members</div>
                      <div>Score</div>
                      <div>Rank</div>
                      <div className="text-right">Actions</div>
                    </div>
                    <div className="divide-y">
                      {teams.map((team, i) => (
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
                          <div className="text-sm">{team.members && team.members.length ? team.members.length : 0}/8</div>
                          <div className="text-sm">{team.score}</div>
                          <div>
                            <Badge variant={i < 3 ? "default" : "outline"} className="text-xs">
                              #{i + 1}
                            </Badge>
                          </div>
                          <div className="flex justify-end gap-2">
                            {isAdmin && (
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
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
              <div className="space-y-8">
                <div className="rounded-md border overflow-x-auto">
                  <div className="min-w-[700px]">
                    <div className="grid grid-cols-5 p-4 font-medium">
                      <div>Team</div>
                      <div>Captain</div>
                      <div>Members</div>
                      <div>Needed</div>
                      <div className="text-right">Actions</div>
                    </div>
                    <div className="divide-y">
                      {teams
                        .filter((team) => {
                          const memberCount = team.members && Array.isArray(team.members) ? team.members.length : 0;
                          return memberCount < 8;
                        })
                        .map((team, i) => (
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
                            <div className="text-sm">{team.members && team.members.length ? team.members.length : 0}/8</div>
                            <div className="text-sm">
                              {8 - (team.members && team.members.length ? team.members.length : 0)} player{8 - (team.members && team.members.length ? team.members.length : 0) !== 1 ? "s" : ""}
                            </div>
                            <div className="flex justify-end gap-2">
                              {isAdmin && (
                                <Button variant="outline" size="sm">
                                  Add Players
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="captain-vote" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Captain Voting</CardTitle>
              <CardDescription>
                Teams currently in the process of voting for a captain
              </CardDescription>
            </CardHeader>
            <CardContent>
              {votingTeamsLoading ? (
                <LoadingSpinner text="Loading voting teams..." />
              ) : votingTeamsError ? (
                <div className="py-4 text-center text-destructive">{votingTeamsError}</div>
              ) : (
                <div className="space-y-8">
                  <div className="rounded-md border overflow-x-auto">
                    <div className="min-w-[700px]">
                      <div className="grid grid-cols-4 p-4 font-medium">
                        <div>Team</div>
                        <div>Members</div>
                        <div>Votes Cast</div>
                        <div>Status</div>
                      </div>
                      <div className="divide-y">
                        {votingTeams.length > 0 ? (
                          votingTeams.map((team) => (
                            <div key={team._id} className="grid grid-cols-4 p-4 items-center">
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
                              <div className="text-sm">{team.members?.length || 0}/{team.totalMembers}</div>
                              <div className="text-sm">{team.votesCast}/{team.totalMembers}</div>
                              <div>
                                <Badge 
                                  variant={team.votingPercentage === 100 ? "default" : "outline"} 
                                  className="text-xs"
                                >
                                  {team.votingPercentage === 100 ? "Complete" : "In Progress"}
                                </Badge>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-muted-foreground">
                            <p>No teams are currently in the captain voting process</p>
                            <p className="text-xs mt-2">Teams without captains will appear here when they have members.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}

function TeamCard({ team, isAdmin, teams }: { team: Team; isAdmin: boolean; teams: Team[] }) {
  // Safe access to members with fallback to empty array
  const members = team.members || []
  const memberCount = Array.isArray(members) ? members.length : 0
  const maxMembers = 8
  
  // Safely find team rank with fallback
  const teamRank = Array.isArray(teams) ? 
    (teams.findIndex((t) => t._id === team._id) + 1) || 1 : 
    1

  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={`/placeholder.svg?height=40&width=40&text=${team.name.substring(0, 2)}`}
              alt={team.name}
            />
            <AvatarFallback>{team.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
        </div>
        <div>
          <CardTitle>{team.name}</CardTitle>
          <CardDescription>
            Captain: {team.captain}
          </CardDescription>
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
              <p className="text-2xl font-bold">#{teamRank}</p>
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
          <div className="pt-2 flex justify-end gap-2">
            {isAdmin && (
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

