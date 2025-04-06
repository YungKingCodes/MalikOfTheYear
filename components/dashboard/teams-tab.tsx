"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Filter, Shuffle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useSession } from "next-auth/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAllTeams, getIncompleteTeams, getTeamsInCaptainVoting } from "@/app/actions/teams"
import { useToast } from "@/components/ui/use-toast"
import { createTeam } from "@/app/actions/teams"
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
  const { data: session } = useSession()
  const user = session?.user
  const isAdmin = user?.role === "admin"

  useEffect(() => {
    async function loadTeams() {
      try {
        setLoading(true)
        const teamsData = await getAllTeams()
        if (Array.isArray(teamsData)) {
          const typedTeams = teamsData.map(team => ({
            ...team,
            members: team.members || []
          }))
          setTeams(typedTeams)
        } else {
          setTeams([])
          setError("Invalid data format received from server")
          console.error("Invalid teams data format:", teamsData)
        }
      } catch (err) {
        console.error("Failed to load teams:", err)
        setError("Failed to load teams. Please try again later.")
        setTeams([])
      } finally {
        setLoading(false)
      }
    }

    loadTeams()
  }, [])

  const handleRandomizeTeams = () => {
    // In a real implementation, this would call an API endpoint
    alert("Teams would be randomized based on player scores")
  }

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
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <Button variant="outline" onClick={handleRandomizeTeams}>
                <Shuffle className="h-4 w-4 mr-2" />
                Randomize Teams
              </Button>
              <CreateTeamDialog />
            </>
          )}
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
                <div className="rounded-md border">
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
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
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
                <div className="rounded-md border">
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
                        // Safely check if members exist and length is less than 8
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
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
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
              <CardDescription>Teams currently in the process of voting for a captain</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 p-4 font-medium">
                    <div>Team</div>
                    <div>Members</div>
                    <div>Votes Cast</div>
                    <div>Status</div>
                    <div className="text-right">Actions</div>
                  </div>
                  <div className="divide-y">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="grid grid-cols-5 p-4 items-center">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={`/placeholder.svg?height=32&width=32&text=T${i + 7}`}
                              alt={`Team ${i + 7}`}
                            />
                            <AvatarFallback>T{i + 7}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">Team {i + 7}</p>
                          </div>
                        </div>
                        <div className="text-sm">{i === 0 ? "8/8" : "7/8"}</div>
                        <div className="text-sm">{i === 0 ? "6/8" : "4/7"}</div>
                        <div>
                          <Badge variant="outline" className="text-xs">
                            In Progress
                          </Badge>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            View Votes
                          </Button>
                          {isAdmin && (
                            <Button variant="ghost" size="sm">
                              Finalize
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
            <Button variant="outline" size="sm">
              View Team
            </Button>
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

export function CreateTeamDialog() {
  const [open, setOpen] = useState(false)
  const [teamName, setTeamName] = useState("")
  const [captainId, setCaptainId] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [activeCompetitionId, setActiveCompetitionId] = useState<string | null>(null)
  const [potentialCaptains, setPotentialCaptains] = useState<Array<{id: string, name: string, image: string | null}>>([])
  const { toast } = useToast()

  // Get active competition ID and potential captains
  useEffect(() => {
    async function loadData() {
      try {
        // Get active competition
        const response = await fetch('/api/competitions/active')
        const data = await response.json()
        if (data.id) {
          setActiveCompetitionId(data.id)
        }

        // Get potential captains (players without a team)
        const playersResponse = await fetch('/api/players?withoutTeam=true')
        const playersData = await playersResponse.json()
        if (Array.isArray(playersData)) {
          setPotentialCaptains(playersData)
        }
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }
    
    if (open) {
      loadData()
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!activeCompetitionId) {
      toast({
        title: "Error",
        description: "No active competition found",
        variant: "destructive"
      })
      return
    }
    
    try {
      setLoading(true)
      
      // Call the server action to create the team
      const result = await createTeam(teamName, activeCompetitionId, captainId)
      
      toast({
        title: "Success",
        description: `Team "${teamName}" has been created`,
      })
      
      // Reset form and close dialog
      setTeamName("")
      setCaptainId(undefined)
      setOpen(false)
      
      // Reload page to show the new team
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create team",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Team
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>Add a new team to the current competition.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="team-name" className="text-right">
                Team Name
              </Label>
              <Input
                id="team-name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="captain" className="text-right">
                Captain (Optional)
              </Label>
              <Select onValueChange={(value) => setCaptainId(value || undefined)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a captain (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {potentialCaptains.length > 0 ? (
                    potentialCaptains.map(captain => (
                      <SelectItem key={captain.id} value={captain.id}>
                        {captain.name || "Unknown Player"}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No available players
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || !teamName}>
              {loading ? "Creating..." : "Create Team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

