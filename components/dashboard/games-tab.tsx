"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Filter, ThumbsUp, Check, Calendar, AlertTriangle, CalendarX } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Textarea } from "@/components/ui/textarea"
import { 
  getGames, 
  getSuggestedGames, 
  assignGameToCompetition, 
  assignTeamToGame, 
  removeTeamFromGame 
} from "@/app/actions/games"
import { getGamesForDashboard } from "@/app/actions/dashboard-stats"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AssignPlayersModal } from "@/components/modals/assign-players-modal"
import { LoadingSpinner } from "@/components/loading-skeletons/competition-detail-skeleton"

interface GameParticipant {
  teamId: string
  score?: number | null
  rank?: number | null
  status: string
  team: {
    id: string
    name: string
  }
}

interface Game {
  id: string
  name: string
  type: string
  date?: Date | string | null
  description: string
  status: string
  location?: string | null
  pointsValue?: number
  competitionId?: string
  votes?: number
  suggested?: boolean
  backupPlan?: string
  difficulty?: string
  winCondition?: string
  materialsNeeded?: string
  cost?: number
  participants?: GameParticipant[]
  category?: string
  duration?: number
  playerCount?: number
  competition?: {
    name: string
    id: string
    year: number
  } | null
  maxTeams?: number
}

interface SuggestedGame {
  id: string
  name: string
  type: string
  description: string
  category: string
  votes: number
  hasVoted?: boolean
  suggestedBy: {
    id: string
    name: string | null
  }
  userVotes?: any[]
}

export function GamesTab({ selectedCompetitionId }: { selectedCompetitionId?: string }) {
  const [games, setGames] = useState<Game[]>([])
  const [suggestedGames, setSuggestedGames] = useState<SuggestedGame[]>([])
  const [upcomingGames, setUpcomingGames] = useState<Game[]>([])
  const [recentGames, setRecentGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()
  const user = session?.user
  const isAdmin = user?.role === "admin"
  const isCaptain = user?.role === "captain"
  const { toast } = useToast()

  // State for competition games
  const [competitionGames, setCompetitionGames] = useState<Game[]>([])
  const [upcomingCompetitionGames, setUpcomingCompetitionGames] = useState<Game[]>([])
  const [completedCompetitionGames, setCompletedCompetitionGames] = useState<Game[]>([])
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null)
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)

  // State for player assignment modal
  const [playerAssignmentOpen, setPlayerAssignmentOpen] = useState(false)
  const [selectedGameForPlayers, setSelectedGameForPlayers] = useState<Game | null>(null)

  useEffect(() => {
    async function loadGames() {
      try {
        setLoading(true)
        
        // Fetch all games data
        const [allGamesData, suggestedGamesData, dashboardGamesData] = await Promise.all([
          getGames(),
          getSuggestedGames(),
          getGamesForDashboard()
        ]);

        // Set the games data
        setGames(allGamesData as Game[] || []);
        setSuggestedGames(suggestedGamesData as SuggestedGame[] || []);
        setUpcomingGames(dashboardGamesData?.upcomingGames as Game[] || []);
        setRecentGames(dashboardGamesData?.recentGames as Game[] || []);
        
        // Filter games by competition ID if provided
        if (selectedCompetitionId) {
          const gamesInCompetition = (allGamesData as Game[]).filter(
            game => game.competitionId === selectedCompetitionId
          );
          setCompetitionGames(gamesInCompetition);
          
          // Separate upcoming and completed games
          setUpcomingCompetitionGames(
            gamesInCompetition.filter(game => game.status === "scheduled")
          );
          setCompletedCompetitionGames(
            gamesInCompetition.filter(game => game.status === "completed")
          );
        } else {
          // If no competition ID provided, use games with any competition ID
          const gamesInCompetition = (allGamesData as Game[]).filter(game => game.competitionId);
          setCompetitionGames(gamesInCompetition);
          
          // Separate upcoming and completed games
          setUpcomingCompetitionGames(
            gamesInCompetition.filter(game => game.status === "scheduled")
          );
          setCompletedCompetitionGames(
            gamesInCompetition.filter(game => game.status === "completed")
          );
        }
        
        setError(null);
      } catch (err) {
        console.error("Failed to load games:", err)
        setError("Failed to load games. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadGames()
  }, [selectedCompetitionId])

  // Function to handle assigning a game to a team as a team captain
  const handleJoinGame = async (gameId: string) => {
    if (!user?.teamId) {
      toast({
        title: "Error",
        description: "You need to be part of a team to join a game",
        variant: "destructive"
      });
      return;
    }

    try {
      await assignTeamToGame(gameId, user.teamId);
      toast({
        title: "Success",
        description: "Your team has been registered for this game",
      });
      
      // Refresh the games list to show the updated participation
      const refreshedGames = await getGames();
      setGames(refreshedGames as Game[] || []);
      
      // Update competition games
      if (selectedCompetitionId) {
        const gamesInCompetition = (refreshedGames as Game[]).filter(
          game => game.competitionId === selectedCompetitionId
        );
        setCompetitionGames(gamesInCompetition);
        
        // Update upcoming and completed games
        setUpcomingCompetitionGames(
          gamesInCompetition.filter(game => game.status === "scheduled")
        );
        setCompletedCompetitionGames(
          gamesInCompetition.filter(game => game.status === "completed")
        );
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to join game",
        variant: "destructive"
      });
    }
  };

  // Function to handle leaving a game as a team captain
  const handleLeaveGame = async (gameId: string) => {
    if (!user?.teamId) {
      toast({
        title: "Error",
        description: "You need to be part of a team to leave a game",
        variant: "destructive"
      });
      return;
    }

    try {
      await removeTeamFromGame(gameId, user.teamId);
      toast({
        title: "Success",
        description: "Your team has been removed from this game",
      });
      
      // Refresh the games list to show the updated participation
      const refreshedGames = await getGames();
      setGames(refreshedGames as Game[] || []);
      
      // Update competition games
      if (selectedCompetitionId) {
        const gamesInCompetition = (refreshedGames as Game[]).filter(
          game => game.competitionId === selectedCompetitionId
        );
        setCompetitionGames(gamesInCompetition);
        
        // Update upcoming and completed games
        setUpcomingCompetitionGames(
          gamesInCompetition.filter(game => game.status === "scheduled")
        );
        setCompletedCompetitionGames(
          gamesInCompetition.filter(game => game.status === "completed")
        );
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to leave game",
        variant: "destructive"
      });
    }
  };

  // Check if the current user's team is participating in a specific game
  const isTeamParticipating = (game: Game) => {
    if (!user?.teamId || !game.participants) return false;
    return game.participants.some(p => p.teamId === user.teamId);
  };

  // Check if a game has reached maximum team count
  const isGameFull = (game: Game) => {
    if (!game.maxTeams || !game.participants) return false;
    return game.participants.length >= game.maxTeams;
  };

  // Function to open the player assignment modal
  const openPlayerAssignment = (game: Game) => {
    setSelectedGameForPlayers(game)
    setPlayerAssignmentOpen(true)
  }

  // Format date and time
  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return "TBD";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };
  
  const formatTime = (dateString: string | Date | null | undefined) => {
    if (!dateString) return "TBD";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { 
      hour: 'numeric', 
      minute: '2-digit'
    });
  };

  if (loading) {
    return <LoadingSpinner text="Loading games..." />
  }

  if (error) {
    return <div className="py-4 text-center text-destructive">{error}</div>
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Competition Games</h2>
          <p className="text-muted-foreground">
            Browse and manage games for {selectedCompetitionId ? "the selected competition" : "all competitions"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <AssignGameToCompetitionDialog games={games} />
              <Button asChild>
                <Link href="/admin/games">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Game
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search games..." className="w-full pl-8" />
        </div>
        <Button variant="outline" className="sm:w-auto">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList className="flex w-full overflow-x-auto">
          <TabsTrigger value="upcoming">Upcoming Games</TabsTrigger>
          <TabsTrigger value="completed">Completed Games</TabsTrigger>
          {isAdmin && <TabsTrigger value="all">All Games</TabsTrigger>}
          {isAdmin && <TabsTrigger value="suggested">Suggested Games</TabsTrigger>}
        </TabsList>

        {/* Upcoming Games Tab */}
        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Games</CardTitle>
              <CardDescription>
                Games scheduled for {selectedCompetitionId ? "the selected competition" : "all competitions"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {upcomingCompetitionGames.length > 0 ? (
                  <div className="rounded-md border">
                    <div className="grid grid-cols-7 p-4 font-medium">
                      <div>Game</div>
                      <div>Date</div>
                      <div>Time</div>
                      <div>Location</div>
                      <div>Teams</div>
                      <div>Status</div>
                      <div className="text-right">Actions</div>
                    </div>
                    <div className="divide-y">
                      {upcomingCompetitionGames.map((game) => {
                        const isParticipating = isTeamParticipating(game);
                        const isFull = isGameFull(game);
                        const teamCount = game.participants?.length || 0;
                        const maxTeams = game.maxTeams || "∞";
                        
                        return (
                          <div key={game.id} className="grid grid-cols-7 p-4 items-center">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{game.name}</span>
                              <span className="text-xs text-muted-foreground">{game.type}</span>
                            </div>
                            <div className="text-sm">{formatDate(game.date)}</div>
                            <div className="text-sm">{formatTime(game.date)}</div>
                            <div className="text-sm">{game.location || "TBD"}</div>
                            <div className="text-sm">
                              {teamCount}/{maxTeams}
                            </div>
                            <div>
                              <Badge 
                                variant="default" 
                                className="text-xs"
                              >
                                Scheduled
                              </Badge>
                            </div>
                            <div className="flex justify-end gap-2">
                              {isCaptain && (
                                <>
                                  {isParticipating ? (
                                    <>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => openPlayerAssignment(game)}
                                      >
                                        Assign Players
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => handleLeaveGame(game.id)}
                                      >
                                        Leave
                                      </Button>
                                    </>
                                  ) : (
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => handleJoinGame(game.id)}
                                      disabled={isFull}
                                    >
                                      {isFull ? "Full" : "Join"}
                                    </Button>
                                  )}
                                </>
                              )}
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/games/${game.id}`}>
                                  View
                                </Link>
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
                    <CalendarX className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                    <h3 className="text-xl font-medium mb-2">No Upcoming Games</h3>
                    <p className="text-muted-foreground mb-6">There are no upcoming games scheduled for this competition yet.</p>
                    {isAdmin && (
                      <AssignGameToCompetitionDialog games={games} />
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Completed Games Tab */}
        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Games</CardTitle>
              <CardDescription>
                Completed games with results for {selectedCompetitionId ? "the selected competition" : "all competitions"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {completedCompetitionGames.length > 0 ? (
                  <div className="rounded-md border">
                    <div className="grid grid-cols-7 p-4 font-medium">
                      <div>Game</div>
                      <div>Date</div>
                      <div>Location</div>
                      <div>Teams</div>
                      <div>Result</div>
                      <div>Points</div>
                      <div className="text-right">Actions</div>
                    </div>
                    <div className="divide-y">
                      {completedCompetitionGames.map((game) => {
                        const teamA = game.participants?.[0];
                        const teamB = game.participants?.[1];
                        const hasMultipleTeams = game.participants && game.participants.length > 1;
                        
                        return (
                          <div key={game.id} className="grid grid-cols-7 p-4 items-center">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{game.name}</span>
                              <span className="text-xs text-muted-foreground">{game.type}</span>
                            </div>
                            <div className="text-sm">{formatDate(game.date)}</div>
                            <div className="text-sm">{game.location || "N/A"}</div>
                            <div className="text-sm">
                              {hasMultipleTeams ? (
                                <div className="flex flex-col gap-1">
                                  <div className="text-xs font-medium">{teamA?.team.name}</div>
                                  <div className="text-xs">vs</div>
                                  <div className="text-xs font-medium">{teamB?.team.name}</div>
                                </div>
                              ) : (
                                game.participants?.map(p => (
                                  <div key={p.teamId} className="text-xs font-medium">{p.team.name}</div>
                                )) || "No teams"
                              )}
                            </div>
                            <div className="text-sm font-medium">
                              {hasMultipleTeams ? (
                                <div className="flex items-center justify-center text-base font-bold">
                                  <span className={teamA?.score && teamB?.score && teamA.score > teamB.score ? "text-green-600" : ""}>{teamA?.score || 0}</span>
                                  <span className="mx-1">-</span>
                                  <span className={teamB?.score && teamA?.score && teamB.score > teamA.score ? "text-green-600" : ""}>{teamB?.score || 0}</span>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  {game.participants?.map(p => (
                                    <div key={p.teamId} className="flex justify-between">
                                      <span className="text-xs">{p.team.name}:</span>
                                      <span className="text-xs font-medium">{p.score || 0}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-sm font-medium">{game.pointsValue || 0}</div>
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/games/${game.id}`}>
                                  Details
                                </Link>
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
                    <Check className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                    <h3 className="text-xl font-medium mb-2">No Completed Games</h3>
                    <p className="text-muted-foreground">There are no completed games for this competition yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Game Pool</CardTitle>
                <CardDescription>All available games that can be selected for competitions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-6 p-4 font-medium">
                      <div className="flex items-center gap-2">
                        {isAdmin && <Checkbox id="select-all" />}
                        <label htmlFor="select-all">Game</label>
                      </div>
                      <div>Type</div>
                      <div>Players</div>
                      <div>Duration</div>
                      <div>Status</div>
                      <div className="text-right">Actions</div>
                    </div>
                    <div className="divide-y">
                      {games.map((game) => {
                        const isSelected = game.status === "scheduled" || game.status === "completed"

                        return (
                          <div key={game.id} className="grid grid-cols-6 p-4 items-center">
                            <div className="flex items-center gap-2">
                              {isAdmin && <Checkbox id={`game-${game.id}`} checked={isSelected} />}
                              <label htmlFor={`game-${game.id}`} className="text-sm font-medium">
                                {game.name}
                              </label>
                            </div>
                            <div className="text-sm">{game.type}</div>
                            <div className="text-sm">
                              {game.playerCount || (game.type === "Team Sport" ? "Team" : game.type === "Relay" ? "4-8 players" : "Individual")}
                            </div>
                            <div className="text-sm">{game.duration ? `${game.duration} min` : "30 min"}</div>
                            <div>
                              <Badge variant={isSelected ? "default" : "outline"} className="text-xs">
                                {isSelected ? "Selected" : "Available"}
                              </Badge>
                            </div>
                            <div className="flex justify-end gap-2">
                              {isAdmin && (
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/admin/games/${game.id}`}>
                                    Edit
                                  </Link>
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/games/${game.id}`}>
                                  View
                                </Link>
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="suggested" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Suggested Games</CardTitle>
                <CardDescription>Games suggested by the community</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-5 p-4 font-medium">
                      <div>Game</div>
                      <div>Type</div>
                      <div>Votes</div>
                      <div>Suggested By</div>
                      <div className="text-right">Actions</div>
                    </div>
                    <div className="divide-y">
                      {suggestedGames.map((game) => (
                        <div key={game.id} className="grid grid-cols-5 p-4 items-center">
                          <div className="text-sm font-medium">{game.name}</div>
                          <div className="text-sm">{game.type}</div>
                          <div className="text-sm">{game.votes}</div>
                          <div className="text-sm">{game.suggestedBy?.name || "Anonymous"}</div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" className={game.hasVoted ? "bg-primary/10" : ""}>
                              <ThumbsUp className={`h-4 w-4 mr-2 ${game.hasVoted ? "text-primary" : ""}`} />
                              {game.hasVoted ? "Voted" : "Vote"}
                            </Button>
                            {isAdmin && (
                              <Button variant="ghost" size="sm">
                                Approve
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
        )}
      </Tabs>

      {selectedGameForPlayers && user?.teamId && (
        <AssignPlayersModal 
          open={playerAssignmentOpen}
          onOpenChange={setPlayerAssignmentOpen}
          gameId={selectedGameForPlayers.id}
          teamId={user.teamId}
          maxPlayers={selectedGameForPlayers.playerCount}
        />
      )}
    </>
  )
}

// Dialog for admins to assign games to competitions
function AssignGameToCompetitionDialog({ games }: { games: Game[] }) {
  const [open, setOpen] = useState(false)
  const [selectedGameId, setSelectedGameId] = useState<string>("")
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>("")
  const [competitions, setCompetitions] = useState<Array<{ id: string; name: string; year: number }>>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Load competitions
  useEffect(() => {
    async function loadCompetitions() {
      try {
        const response = await fetch('/api/competitions')
        const data = await response.json()
        if (Array.isArray(data)) {
          setCompetitions(data.map(comp => ({
            id: comp.id,
            name: comp.name,
            year: comp.year
          })))
        }
      } catch (error) {
        console.error('Failed to load competitions:', error)
      }
    }

    if (open) {
      loadCompetitions()
    }
  }, [open])

  // Filter out games that already have a competition assigned
  const availableGames = games.filter(game => !game.competitionId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedGameId || !selectedCompetitionId) {
      toast({
        title: "Error",
        description: "Please select both a game and a competition",
        variant: "destructive"
      })
      return
    }
    
    try {
      setLoading(true)
      await assignGameToCompetition(selectedGameId, selectedCompetitionId)
      
      toast({
        title: "Success",
        description: "Game has been assigned to the competition",
      })
      
      // Reset form and close dialog
      setSelectedGameId("")
      setSelectedCompetitionId("")
      setOpen(false)
      
      // Refresh the page to show changes
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to assign game to competition",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          Assign Game
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Assign Game to Competition</DialogTitle>
            <DialogDescription>Select a game and competition to assign it to</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="game" className="text-right">
                Game
              </Label>
              <Select value={selectedGameId} onValueChange={setSelectedGameId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a game" />
                </SelectTrigger>
                <SelectContent>
                  {availableGames.length > 0 ? (
                    availableGames.map(game => (
                      <SelectItem key={game.id} value={game.id}>
                        {game.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No available games
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="competition" className="text-right">
                Competition
              </Label>
              <Select value={selectedCompetitionId} onValueChange={setSelectedCompetitionId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a competition" />
                </SelectTrigger>
                <SelectContent>
                  {competitions.length > 0 ? (
                    competitions.map(comp => (
                      <SelectItem key={comp.id} value={comp.id}>
                        {comp.name} ({comp.year})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No competitions found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || !selectedGameId || !selectedCompetitionId}>
              {loading ? "Assigning..." : "Assign Game"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

