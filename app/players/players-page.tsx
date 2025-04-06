"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Filter } from "lucide-react"
import { useSession } from "next-auth/react"
import { getUsers, getUnassignedPlayers, getTeamCaptains, getTitledPlayers } from "@/lib/data"
import { PlayerDetailsModal } from "@/components/modals/player-details-modal"
import { canViewPlayerScores } from "@/lib/auth-utils"
import { AuthLoadingOverlay } from "@/components/ui/auth-loading-overlay"
import { PlayersSkeleton } from "@/components/loading-skeletons/players-skeleton"

// Function to render loading state
function LoadingState() {
  return <PlayersSkeleton />
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<any[]>([])
  const [unassignedPlayers, setUnassignedPlayers] = useState<any[]>([])
  const [captains, setCaptains] = useState<any[]>([])
  const [titledPlayers, setTitledPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()
  const user = session?.user

  // For player details modal
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [playerDetailsOpen, setPlayerDetailsOpen] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [allPlayers, unassigned, captainsList, titled] = await Promise.all([
          getUsers(),
          getUnassignedPlayers(),
          getTeamCaptains(),
          getTitledPlayers(),
        ])

        setPlayers(allPlayers)
        setUnassignedPlayers(unassigned)
        setCaptains(captainsList)
        setTitledPlayers(titled)
        setError(null)
      } catch (err) {
        console.error("Failed to load players data:", err)
        setError("Failed to load players data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleViewPlayer = (playerId: string) => {
    setSelectedPlayerId(playerId)
    setPlayerDetailsOpen(true)
  }

  // Check if user can view player scores
  const canUserViewPlayerScores = (teamId?: string) => {
    return canViewPlayerScores(session)
  }

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return <div className="py-8 text-center text-destructive">{error}</div>
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Players</h1>
          <p className="text-muted-foreground">Manage player profiles, skills, and team assignments</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search players..." className="w-full pl-8" />
        </div>
        <Button variant="outline" className="sm:w-auto">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Players</TabsTrigger>
          <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
          <TabsTrigger value="captains">Captains</TabsTrigger>
          <TabsTrigger value="titled">Titled</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Player Roster</CardTitle>
              <CardDescription>All registered players for the 2025 competition</CardDescription>
            </CardHeader>
            <CardContent>
              {players.length > 0 ? (
                <div className="space-y-8">
                  <div className="rounded-md border">
                    <div className="hidden md:grid md:grid-cols-6 p-4 font-medium">
                      <div>Player</div>
                      <div>Team</div>
                      <div>Proficiency Score</div>
                      <div>Titles</div>
                      <div>Status</div>
                      <div className="text-right">Actions</div>
                    </div>
                    <div className="divide-y">
                      {players.map((player) => (
                        <div
                          key={player._id}
                          className="flex flex-col md:grid md:grid-cols-6 p-4 gap-2 md:gap-0 md:items-center"
                        >
                          <div className="flex items-center justify-between w-full md:justify-start md:w-auto md:col-span-1">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={`/placeholder.svg?height=32&width=32&text=${player.name.substring(0, 2)}`}
                                  alt={player.name}
                                />
                                <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{player.name}</p>
                                <p className="text-xs text-muted-foreground">{player.position}</p>
                              </div>
                            </div>
                            <div className="md:hidden">
                              <PlayerActions playerId={player._id} teamId={player.teamId} onView={handleViewPlayer} />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 md:hidden">
                            <div className="text-xs text-muted-foreground">Team:</div>
                            <div className="text-sm">
                              {player.teamId
                                ? player.teamId === "team1"
                                  ? "Mountain Goats"
                                  : player.teamId === "team2"
                                    ? "Royal Rams"
                                    : player.teamId === "team3"
                                      ? "Athletic Antelopes"
                                      : player.teamId === "team4"
                                        ? "Speed Sheep"
                                        : player.teamId
                                : "Unassigned"}
                            </div>

                            <div className="text-xs text-muted-foreground">Proficiency:</div>
                            <div className="text-sm">
                              {canUserViewPlayerScores(player.teamId) ? player.proficiencyScore : "Hidden"}
                            </div>

                            <div className="text-xs text-muted-foreground">Titles:</div>
                            <div>
                              {player.titles && player.titles.length > 0 ? (
                                <Badge variant="secondary" className="text-xs">
                                  {player.titles[0]}
                                </Badge>
                              ) : (
                                "None"
                              )}
                            </div>

                            <div className="text-xs text-muted-foreground">Status:</div>
                            <div>
                              <Badge variant={player.teamId ? "success" : "outline"} className="text-xs">
                                {player.teamId ? "Active" : "Pending"}
                              </Badge>
                            </div>
                          </div>

                          <div className="hidden md:block">
                            {player.teamId
                              ? player.teamId === "team1"
                                ? "Mountain Goats"
                                : player.teamId === "team2"
                                  ? "Royal Rams"
                                  : player.teamId === "team3"
                                    ? "Athletic Antelopes"
                                    : player.teamId === "team4"
                                      ? "Speed Sheep"
                                      : player.teamId
                              : "Unassigned"}
                          </div>
                          <div className="hidden md:block text-sm">
                            {canUserViewPlayerScores(player.teamId) ? player.proficiencyScore : "Hidden"}
                          </div>
                          <div className="hidden md:block">
                            {player.titles && player.titles.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {player.titles[0]}
                              </Badge>
                            )}
                          </div>
                          <div className="hidden md:block">
                            <Badge variant={player.teamId ? "success" : "outline"} className="text-xs">
                              {player.teamId ? "Active" : "Pending"}
                            </Badge>
                          </div>
                          <div className="hidden md:flex justify-end gap-2">
                            <PlayerActions playerId={player._id} teamId={player.teamId} onView={handleViewPlayer} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
                  <h3 className="text-xl font-medium mb-2">No Players Found</h3>
                  <p className="text-muted-foreground mb-6">There are no players registered for the competition yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unassigned" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Unassigned Players</CardTitle>
              <CardDescription>Players who have not been assigned to a team</CardDescription>
            </CardHeader>
            <CardContent>
              {unassignedPlayers.length > 0 ? (
                <div className="space-y-8">
                  <div className="rounded-md border">
                    <div className="hidden md:grid md:grid-cols-5 p-4 font-medium">
                      <div>Player</div>
                      <div>Proficiency Score</div>
                      <div>Titles</div>
                      <div>Status</div>
                      <div className="text-right">Actions</div>
                    </div>
                    <div className="divide-y">
                      {unassignedPlayers.map((player) => (
                        <div
                          key={player._id}
                          className="flex flex-col md:grid md:grid-cols-5 p-4 gap-2 md:gap-0 md:items-center"
                        >
                          <div className="flex items-center justify-between w-full md:justify-start md:w-auto md:col-span-1">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={`/placeholder.svg?height=32&width=32&text=${player.name.substring(0, 2)}`}
                                  alt={player.name}
                                />
                                <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{player.name}</p>
                                <p className="text-xs text-muted-foreground">Unassigned</p>
                              </div>
                            </div>
                            <div className="md:hidden">
                              <UnassignedPlayerActions playerId={player._id} />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 md:hidden">
                            <div className="text-xs text-muted-foreground">Proficiency:</div>
                            <div className="text-sm">
                              {canUserViewPlayerScores(player.teamId) ? player.proficiencyScore : "Hidden"}
                            </div>

                            <div className="text-xs text-muted-foreground">Titles:</div>
                            <div>
                              {player.titles && player.titles.length > 0 ? (
                                <Badge variant="secondary" className="text-xs">
                                  {player.titles[0]}
                                </Badge>
                              ) : (
                                "None"
                              )}
                            </div>

                            <div className="text-xs text-muted-foreground">Status:</div>
                            <div>
                              <Badge variant="outline" className="text-xs">
                                Pending
                              </Badge>
                            </div>
                          </div>

                          <div className="hidden md:block text-sm">
                            {canUserViewPlayerScores(player.teamId) ? player.proficiencyScore : "Hidden"}
                          </div>
                          <div className="hidden md:block">
                            {player.titles && player.titles.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {player.titles[0]}
                              </Badge>
                            )}
                          </div>
                          <div className="hidden md:block">
                            <Badge variant="outline" className="text-xs">
                              Pending
                            </Badge>
                          </div>
                          <div className="hidden md:flex justify-end gap-2">
                            <UnassignedPlayerActions playerId={player._id} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
                  <h3 className="text-xl font-medium mb-2">No Unassigned Players</h3>
                  <p className="text-muted-foreground">All players have been assigned to teams.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="captains" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Captains</CardTitle>
              <CardDescription>Players who are assigned as team captains</CardDescription>
            </CardHeader>
            <CardContent>
              {captains.length > 0 ? (
                <div className="space-y-8">
                  <div className="rounded-md border">
                    <div className="hidden md:grid md:grid-cols-5 p-4 font-medium">
                      <div>Captain</div>
                      <div>Team</div>
                      <div>Proficiency Score</div>
                      <div>Titles</div>
                      <div className="text-right">Actions</div>
                    </div>
                    <div className="divide-y">
                      {captains.map((captain) => (
                        <div
                          key={captain._id}
                          className="flex flex-col md:grid md:grid-cols-5 p-4 gap-2 md:gap-0 md:items-center"
                        >
                          <div className="flex items-center justify-between w-full md:justify-start md:w-auto md:col-span-1">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={`/placeholder.svg?height=32&width=32&text=${captain.name.substring(0, 2)}`}
                                  alt={captain.name}
                                />
                                <AvatarFallback>{captain.name.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{captain.name}</p>
                                <p className="text-xs text-muted-foreground">Since June 1, 2025</p>
                              </div>
                            </div>
                            <div className="md:hidden">
                              <CaptainActions playerId={captain._id} teamId={captain.teamId} />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 md:hidden">
                            <div className="text-xs text-muted-foreground">Team:</div>
                            <div className="text-sm">
                              {captain.teamId === "team1"
                                ? "Mountain Goats"
                                : captain.teamId === "team2"
                                  ? "Royal Rams"
                                  : captain.teamId === "team3"
                                    ? "Athletic Antelopes"
                                    : captain.teamId === "team4"
                                      ? "Speed Sheep"
                                      : captain.teamId}
                            </div>

                            <div className="text-xs text-muted-foreground">Proficiency:</div>
                            <div className="text-sm">
                              {canUserViewPlayerScores(captain.teamId) ? captain.proficiencyScore : "Hidden"}
                            </div>

                            <div className="text-xs text-muted-foreground">Titles:</div>
                            <div>
                              {captain.titles && captain.titles.length > 0 ? (
                                <Badge variant="secondary" className="text-xs">
                                  {captain.titles[0]}
                                </Badge>
                              ) : (
                                "None"
                              )}
                            </div>
                          </div>

                          <div className="hidden md:block text-sm">
                            {captain.teamId === "team1"
                              ? "Mountain Goats"
                              : captain.teamId === "team2"
                                ? "Royal Rams"
                                : captain.teamId === "team3"
                                  ? "Athletic Antelopes"
                                  : captain.teamId === "team4"
                                    ? "Speed Sheep"
                                    : captain.teamId}
                          </div>
                          <div className="hidden md:block text-sm">
                            {canUserViewPlayerScores(captain.teamId) ? captain.proficiencyScore : "Hidden"}
                          </div>
                          <div className="hidden md:block">
                            {captain.titles && captain.titles.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {captain.titles[0]}
                              </Badge>
                            )}
                          </div>
                          <div className="hidden md:flex justify-end gap-2">
                            <CaptainActions playerId={captain._id} teamId={captain.teamId} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
                  <h3 className="text-xl font-medium mb-2">No Team Captains</h3>
                  <p className="text-muted-foreground">No team captains have been assigned yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="titled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Titled Players</CardTitle>
              <CardDescription>Players who have earned special titles</CardDescription>
            </CardHeader>
            <CardContent>
              {titledPlayers.length > 0 ? (
                <div className="space-y-8">
                  <div className="rounded-md border">
                    <div className="hidden md:grid md:grid-cols-5 p-4 font-medium">
                      <div>Player</div>
                      <div>Team</div>
                      <div>Titles</div>
                      <div>Year Earned</div>
                      <div className="text-right">Actions</div>
                    </div>
                    <div className="divide-y">
                      {titledPlayers.map((player) => (
                        <div
                          key={player._id}
                          className="flex flex-col md:grid md:grid-cols-5 p-4 gap-2 md:gap-0 md:items-center"
                        >
                          <div className="flex items-center justify-between w-full md:justify-start md:w-auto md:col-span-1">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={`/placeholder.svg?height=32&width=32&text=${player.name.substring(0, 2)}`}
                                  alt={player.name}
                                />
                                <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{player.name}</p>
                                <p className="text-xs text-muted-foreground">{player.position}</p>
                              </div>
                            </div>
                            <div className="md:hidden">
                              <TitledPlayerActions playerId={player._id} teamId={player.teamId} />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 md:hidden">
                            <div className="text-xs text-muted-foreground">Team:</div>
                            <div className="text-sm">
                              {player.teamId === "team1"
                                ? "Mountain Goats"
                                : player.teamId === "team2"
                                  ? "Royal Rams"
                                  : player.teamId === "team3"
                                    ? "Athletic Antelopes"
                                    : player.teamId === "team4"
                                      ? "Speed Sheep"
                                      : "Unassigned"}
                            </div>

                            <div className="text-xs text-muted-foreground">Titles:</div>
                            <div>
                              {player.titles.map((title: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs mr-1">
                                  {title}
                                </Badge>
                              ))}
                            </div>

                            <div className="text-xs text-muted-foreground">Year Earned:</div>
                            <div className="text-sm">{player.titles[0].includes("'24") ? "2024" : "2023"}</div>
                          </div>

                          <div className="hidden md:block text-sm">
                            {player.teamId === "team1"
                              ? "Mountain Goats"
                              : player.teamId === "team2"
                                ? "Royal Rams"
                                : player.teamId === "team3"
                                  ? "Athletic Antelopes"
                                  : player.teamId === "team4"
                                    ? "Speed Sheep"
                                    : "Unassigned"}
                          </div>
                          <div className="hidden md:block">
                            {player.titles.map((title: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs mr-1">
                                {title}
                              </Badge>
                            ))}
                          </div>
                          <div className="hidden md:block text-sm">
                            {player.titles[0].includes("'24") ? "2024" : "2023"}
                          </div>
                          <div className="hidden md:flex justify-end gap-2">
                            <TitledPlayerActions playerId={player._id} teamId={player.teamId} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
                  <h3 className="text-xl font-medium mb-2">No Titled Players</h3>
                  <p className="text-muted-foreground">No players have earned special titles yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Player Details Modal */}
      <PlayerDetailsModal playerId={selectedPlayerId} open={playerDetailsOpen} onOpenChange={setPlayerDetailsOpen} />
    </div>
  )
}

function PlayerActions({
  playerId,
  teamId,
  onView,
}: { playerId: string; teamId?: string; onView: (playerId: string) => void }) {
  const { data: session } = useSession()
  const user = session?.user
  const isAdmin = user?.role === "admin"
  const isCaptain = user?.role === "captain" && user?.teamId === teamId

  return (
    <>
      {isAdmin && (
        <Button variant="ghost" size="sm">
          Edit
        </Button>
      )}
      <Button variant="ghost" size="sm" onClick={() => onView(playerId)}>
        View
      </Button>
    </>
  )
}

function UnassignedPlayerActions({ playerId }: { playerId: string }) {
  const { data: session } = useSession()
  const user = session?.user
  const isAdmin = user?.role === "admin"

  return (
    <>
      {isAdmin && (
        <Button variant="ghost" size="sm">
          Assign
        </Button>
      )}
      <Button variant="ghost" size="sm">
        View
      </Button>
    </>
  )
}

function CaptainActions({ playerId, teamId }: { playerId: string; teamId?: string }) {
  const { data: session } = useSession()
  const user = session?.user
  const isAdmin = user?.role === "admin"

  return (
    <>
      {isAdmin && (
        <Button variant="ghost" size="sm">
          Edit
        </Button>
      )}
      <Button variant="ghost" size="sm">
        View
      </Button>
    </>
  )
}

function TitledPlayerActions({ playerId, teamId }: { playerId: string; teamId?: string }) {
  const { data: session } = useSession()
  const user = session?.user
  const isAdmin = user?.role === "admin"

  return (
    <>
      {isAdmin && (
        <Button variant="ghost" size="sm">
          Edit
        </Button>
      )}
      <Button variant="ghost" size="sm">
        View
      </Button>
    </>
  )
}

