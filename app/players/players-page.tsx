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
import { getUsers, getUnassignedPlayers, getTeamCaptains, getTitledPlayers, getTeams } from "@/lib/data"
import { PlayerDetailsModal } from "@/components/modals/player-details-modal"
import { canViewPlayerScores } from "@/lib/auth-utils"
import { AuthLoadingOverlay } from "@/components/ui/auth-loading-overlay"
import { PlayersSkeleton } from "@/components/loading-skeletons/players-skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { PlayerData } from "@/types/player"

// Function to render loading state
function LoadingState() {
  return <PlayersSkeleton />
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<PlayerData[]>([])
  const [unassignedPlayers, setUnassignedPlayers] = useState<PlayerData[]>([])
  const [captains, setCaptains] = useState<PlayerData[]>([])
  const [titledPlayers, setTitledPlayers] = useState<PlayerData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()
  const user = session?.user

  // For search and filtering
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [filters, setFilters] = useState({
    role: "",
    team: "",
    hasTitles: false
  })
  
  // Original data for filtering
  const [allPlayersData, setAllPlayersData] = useState<PlayerData[]>([])
  
  // Team data for filters
  const [teams, setTeams] = useState<any[]>([])
  
  // For player details modal
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [playerDetailsOpen, setPlayerDetailsOpen] = useState(false)

  // Load teams for filters
  useEffect(() => {
    async function loadTeams() {
      try {
        const teamsData = await getTeams()
        setTeams(teamsData)
      } catch (err) {
        console.error("Failed to load teams data:", err)
      }
    }
    
    loadTeams()
  }, [])

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        
        // Get players with the current filters
        const filterOptions = {
          search: searchQuery,
          role: filters.role,
          team: filters.team,
          hasTitles: filters.hasTitles
        }
        
        const filteredPlayers = await getUsers(filterOptions)
        
        // Calculate derived data from filtered players
        const unassigned = filteredPlayers.filter((p: PlayerData) => !p.teamId)
        const captainsList = filteredPlayers.filter((p: PlayerData) => p.role === "captain")
        const titled = filteredPlayers.filter((p: PlayerData) => p.titles && p.titles.length > 0)
        
        setPlayers(filteredPlayers)
        setUnassignedPlayers(unassigned)
        setCaptains(captainsList)
        setTitledPlayers(titled)
        setAllPlayersData(filteredPlayers) // Keep this for reference
        
        setError(null)
      } catch (err) {
        console.error("Failed to load players data:", err)
        setError("Failed to load players data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    // Debounce the loading to prevent too many requests
    const handler = setTimeout(() => {
      loadData()
    }, 300)

    return () => clearTimeout(handler)
  }, [searchQuery, filters])

  const handleViewPlayer = (playerId: string) => {
    // Make sure playerId exists before using it
    if (playerId) {
      setSelectedPlayerId(playerId)
      setPlayerDetailsOpen(true)
    }
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }
  
  // Toggle filter menu
  const toggleFilterMenu = () => {
    setShowFilterMenu(!showFilterMenu)
  }
  
  // Apply a filter
  const applyFilter = (filterType: string, value: string | boolean) => {
    setFilters({
      ...filters,
      [filterType]: value
    })
  }
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      role: "",
      team: "",
      hasTitles: false
    })
    setSearchQuery("")
  }

  // Check if user can view player scores
  const canUserViewPlayerScores = (teamId?: string) => {
    return canViewPlayerScores(session)
  }

  // Function to get team name by ID
  const getTeamNameById = (teamId: string) => {
    if (!teamId) return "Unassigned";
    
    const team = teams.find(team => team._id === teamId);
    return team ? team.name : "Unknown Team";
  };

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
          <Input 
            type="search" 
            placeholder="Search players..." 
            className="w-full pl-8" 
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <div className="relative">
          <Button 
            variant="outline" 
            className="sm:w-auto"
            onClick={toggleFilterMenu}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter {Object.values(filters).some(v => v) && "(Active)"}
          </Button>
          
          {showFilterMenu && (
            <Card className="absolute right-0 top-full mt-2 w-64 z-10">
              <CardContent className="p-4 space-y-4">
                <h3 className="font-medium text-sm">Filter Players</h3>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Role</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge 
                      variant={filters.role === "player" ? "default" : "outline"} 
                      className="cursor-pointer"
                      onClick={() => applyFilter("role", filters.role === "player" ? "" : "player")}
                    >
                      Player
                    </Badge>
                    <Badge 
                      variant={filters.role === "captain" ? "default" : "outline"} 
                      className="cursor-pointer"
                      onClick={() => applyFilter("role", filters.role === "captain" ? "" : "captain")}
                    >
                      Captain
                    </Badge>
                    <Badge 
                      variant={filters.role === "admin" ? "default" : "outline"} 
                      className="cursor-pointer"
                      onClick={() => applyFilter("role", filters.role === "admin" ? "" : "admin")}
                    >
                      Admin
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Team</p>
                  <div className="flex flex-wrap gap-2">
                    {teams.length > 0 ? (
                      teams.map(team => (
                        <Badge 
                          key={team.id}
                          variant={filters.team === team.id ? "default" : "outline"} 
                          className="cursor-pointer"
                          onClick={() => applyFilter("team", filters.team === team.id ? "" : team.id)}
                        >
                          {team.name}
                        </Badge>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">Loading teams...</div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="titles" 
                      checked={filters.hasTitles}
                      onCheckedChange={(checked) => applyFilter("hasTitles", !!checked)}
                    />
                    <label
                      htmlFor="titles"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Has titles/awards
                    </label>
                  </div>
                </div>
                
                <div className="pt-2 flex justify-between">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                  <Button variant="default" size="sm" onClick={toggleFilterMenu}>
                    Apply
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
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
                    <div className="hidden md:grid md:grid-cols-12 p-4 font-medium border-b">
                      <div className="col-span-4">Player</div>
                      {canUserViewPlayerScores() && <div className="col-span-2">Proficiency Score</div>}
                      <div className="col-span-3">Titles</div>
                      <div className="col-span-2">Status</div>
                      <div className="col-span-1 text-right">Actions</div>
                    </div>
                    <div className="divide-y">
                      {players.map((player, playerIndex) => (
                        <div
                          key={player._id || player.id || `player-${playerIndex}`}
                          className={`flex flex-col md:grid md:grid-cols-12 p-4 gap-4 md:gap-0 md:items-center hover:bg-muted/50 transition-colors`}
                        >
                          {/* Player Info */}
                          <div className="flex items-center justify-between w-full md:justify-start md:w-auto md:col-span-4">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={`/placeholder.svg?height=40&width=40&text=${player.name.substring(0, 2)}`}
                                  alt={player.name}
                                />
                                <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div className="space-y-1">
                                <p className="font-medium leading-none">{player.name}</p>
                                <p className="text-sm text-muted-foreground">{player.position}</p>
                              </div>
                            </div>
                            <div className="md:hidden">
                              <PlayerActions 
                                playerId={player._id || player.id || `player-${playerIndex}`} 
                                teamId={player.teamId} 
                                onView={handleViewPlayer} 
                              />
                            </div>
                          </div>

                          {/* Mobile View */}
                          <div className="grid grid-cols-2 gap-4 md:hidden">
                            {canUserViewPlayerScores(player.teamId) && (
                              <>
                                <div className="text-sm text-muted-foreground">Proficiency</div>
                                <div className="font-medium">
                                  {player.proficiencyScore}
                                </div>
                              </>
                            )}

                            <div className="text-sm text-muted-foreground">Titles</div>
                            <div>
                              {player.titles && player.titles.length > 0 ? (
                                <Badge variant="secondary">
                                  {player.titles[0]}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">No titles earned</span>
                              )}
                            </div>

                            <div className="text-sm text-muted-foreground">Status</div>
                            <div>
                              <Badge variant={player.teamId ? "success" : "outline"}>
                                {player.teamId ? "Active" : "Pending"}
                              </Badge>
                            </div>
                          </div>

                          {/* Desktop View */}
                          {canUserViewPlayerScores(player.teamId) && (
                            <div className="hidden md:flex items-center md:col-span-2 font-medium">
                              {player.proficiencyScore}
                            </div>
                          )}
                          <div className="hidden md:flex items-center md:col-span-3">
                            {player.titles && player.titles.length > 0 ? (
                              <Badge variant="secondary">
                                {player.titles[0]}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">No titles earned</span>
                            )}
                          </div>
                          <div className="hidden md:flex items-center md:col-span-2">
                            <Badge variant={player.teamId ? "success" : "outline"}>
                              {player.teamId ? "Active" : "Pending"}
                            </Badge>
                          </div>
                          <div className="hidden md:flex justify-end items-center md:col-span-1">
                            <PlayerActions 
                              playerId={player._id || player.id || `player-${playerIndex}`} 
                              teamId={player.teamId} 
                              onView={handleViewPlayer} 
                            />
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
                      {unassignedPlayers.map((player, playerIndex) => (
                        <div
                          key={player._id || player.id || `unassigned-${playerIndex}`}
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
                              <UnassignedPlayerActions playerId={player._id || player.id || `unassigned-${playerIndex}`} />
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
                            <UnassignedPlayerActions playerId={player._id || player.id || `unassigned-${playerIndex}`} />
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
                      {captains.map((captain, captainIndex) => (
                        <div
                          key={captain._id || captain.id || `captain-${captainIndex}`}
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
                              <CaptainActions playerId={captain._id || captain.id || `captain-${captainIndex}`} teamId={captain.teamId} />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 md:hidden">
                            <div className="text-xs text-muted-foreground">Team:</div>
                            <div className="text-sm">
                              {getTeamNameById(captain.teamId)}
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
                            {getTeamNameById(captain.teamId)}
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
                            <CaptainActions playerId={captain._id || captain.id || `captain-${captainIndex}`} teamId={captain.teamId} />
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
                      {titledPlayers.map((player, playerIndex) => (
                        <div
                          key={player._id || player.id || `titled-${playerIndex}`}
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
                              <TitledPlayerActions playerId={player._id || player.id || `titled-${playerIndex}`} teamId={player.teamId} />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 md:hidden">
                            <div className="text-xs text-muted-foreground">Team:</div>
                            <div className="text-sm">
                              {player.teamId ? getTeamNameById(player.teamId) : "Unassigned"}
                            </div>

                            <div className="text-xs text-muted-foreground">Titles:</div>
                            <div>
                              {player.titles.map((title: string, index: number) => (
                                <Badge 
                                  key={`${player._id || player.id || playerIndex}-mobile-title-${index}`} 
                                  variant="secondary" 
                                  className="text-xs mr-1"
                                >
                                  {title}
                                </Badge>
                              ))}
                            </div>

                            <div className="text-xs text-muted-foreground">Year Earned:</div>
                            <div className="text-sm">{player.titles[0].includes("'24") ? "2024" : "2023"}</div>
                          </div>

                          <div className="hidden md:block text-sm">
                            {player.teamId ? getTeamNameById(player.teamId) : "Unassigned"}
                          </div>
                          <div className="hidden md:block">
                            {player.titles.map((title: string, index: number) => (
                              <Badge 
                                key={`${player._id || player.id || playerIndex}-desktop-title-${index}`} 
                                variant="secondary" 
                                className="text-xs mr-1"
                              >
                                {title}
                              </Badge>
                            ))}
                          </div>
                          <div className="hidden md:block text-sm">
                            {player.titles[0].includes("'24") ? "2024" : "2023"}
                          </div>
                          <div className="hidden md:flex justify-end gap-2">
                            <TitledPlayerActions playerId={player._id || player.id || `titled-${playerIndex}`} teamId={player.teamId} />
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