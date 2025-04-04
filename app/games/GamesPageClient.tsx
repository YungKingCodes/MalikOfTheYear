"use client"

import type React from "react"

import { useState, useEffect, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Filter, ThumbsUp, Check } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useSession } from "next-auth/react"
import { getGames, getSuggestedGames } from "@/lib/data"
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
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { GameDetailsModal } from "@/components/modals/game-details-modal"
import { AuthLoadingOverlay } from "@/components/ui/auth-loading-overlay"
import { GamesSkeleton } from "@/components/loading-skeletons/games-skeleton"

export default function GamesPageClient() {
  const [games, setGames] = useState<any[]>([])
  const [suggestedGames, setSuggestedGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const { data: session, status } = useSession()
  const user = session?.user
  const isAdmin = user?.role === "admin"
  const { toast } = useToast()
  const router = useRouter()

  // For game details modal
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null)
  const [gameDetailsOpen, setGameDetailsOpen] = useState(false)

  useEffect(() => {
    // Redirect if not logged in - this is now handled by the ProtectedRoute component
    // in page.tsx, so we don't need to redirect here anymore
    
    async function loadData() {
      try {
        setLoading(true)

        startTransition(async () => {
          try {
            // First try to get regular games
            const gamesData = await getGames().catch(() => [])
            setGames(gamesData)

            // Then try to get suggested games separately
            try {
              const suggestedGamesData = await getSuggestedGames()
              setSuggestedGames(suggestedGamesData)
            } catch (suggestedError) {
              console.error("Failed to load suggested games:", suggestedError)
              setSuggestedGames([])
            }

            setError(null)
          } catch (err) {
            console.error("Failed to load games data:", err)
            setError("Failed to load games data. Please try again later.")
          } finally {
            setLoading(false)
          }
        })
      } catch (err) {
        console.error("Failed to load games data:", err)
        setError("Failed to load games data. Please try again later.")
        setLoading(false)
      }
    }

    if (status !== "loading") {
      loadData()
    }
  }, [status])

  const handleVote = (gameId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to vote on suggested games.",
        variant: "destructive",
      })
      return
    }

    // In a real implementation, this would call an API endpoint
    setSuggestedGames((prev) =>
      prev.map((game) => (game._id === gameId ? { ...game, votes: game.votes + 1, userVoted: true } : game)),
    )

    toast({
      title: "Vote recorded",
      description: "Your vote has been recorded. Thank you for your input!",
    })
  }

  const handleViewGame = (gameId: string) => {
    setSelectedGameId(gameId)
    setGameDetailsOpen(true)
  }

  if (loading || isPending || status === "loading") {
    return (
      <>
        <AuthLoadingOverlay className="" />
        <GamesSkeleton />
      </>
    )
  }

  if (error) {
    return (
      <div className="py-8 text-center text-destructive animate-in fade-in-50 duration-500">
        <p className="mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 animate-in fade-in-50 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Games</h1>
          <p className="text-muted-foreground">Manage games, schedule events, and track results</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Game
            </Button>
          ) : (
            <SuggestGameDialog />
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

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Games</TabsTrigger>
          <TabsTrigger value="selected">2025 Selected</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="suggested">Suggested</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Game Pool</CardTitle>
              <CardDescription>All available games that can be selected for competitions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="rounded-md border">
                  <div className="hidden md:grid md:grid-cols-6 p-4 font-medium">
                    <div className="flex items-center gap-2">
                      <AdminOnlyCheckbox id="select-all" />
                      <label htmlFor="select-all">Game</label>
                    </div>
                    <div>Type</div>
                    <div>Players</div>
                    <div>Duration</div>
                    <div>Status</div>
                    <div className="text-right">Actions</div>
                  </div>
                  <div className="divide-y">
                    {games.map((game, i) => {
                      const isSelected = game.status === "scheduled" || game.status === "completed"
                      const gameType = game.type || "Team Sport"

                      return (
                        <div
                          key={game._id}
                          className="flex flex-col md:grid md:grid-cols-6 p-4 gap-2 md:gap-0 md:items-center"
                        >
                          <div className="flex items-center justify-between w-full md:justify-start md:w-auto">
                            <div className="flex items-center gap-2">
                              <AdminOnlyCheckbox id={`game-${i}`} checked={isSelected} />
                              <label htmlFor={`game-${i}`} className="text-sm font-medium">
                                {game.name}
                              </label>
                            </div>
                            <div className="md:hidden">
                              <GameActions game={game} onView={handleViewGame} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 md:hidden">
                            <div className="text-xs text-muted-foreground">Type:</div>
                            <div className="text-sm">{gameType}</div>

                            <div className="text-xs text-muted-foreground">Players:</div>
                            <div className="text-sm">
                              {gameType === "Team Sport" ? "Team" : gameType === "Relay" ? "4-8 players" : "Individual"}
                            </div>

                            <div className="text-xs text-muted-foreground">Duration:</div>
                            <div className="text-sm">{30 + (i % 3) * 15} min</div>

                            <div className="text-xs text-muted-foreground">Status:</div>
                            <div>
                              <Badge variant={isSelected ? "default" : "outline"} className="text-xs">
                                {isSelected ? "Selected 2025" : "Available"}
                              </Badge>
                            </div>
                          </div>
                          <div className="hidden md:block">{gameType}</div>
                          <div className="hidden md:block text-sm">
                            {gameType === "Team Sport" ? "Team" : gameType === "Relay" ? "4-8 players" : "Individual"}
                          </div>
                          <div className="hidden md:block text-sm">{30 + (i % 3) * 15} min</div>
                          <div className="hidden md:block">
                            <Badge variant={isSelected ? "default" : "outline"} className="text-xs">
                              {isSelected ? "Selected 2025" : "Available"}
                            </Badge>
                          </div>
                          <div className="hidden md:flex justify-end gap-2">
                            <GameActions game={game} onView={handleViewGame} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <AdminOnlySaveButton />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="selected" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <Card>
            <CardHeader>
              <CardTitle>2025 Selected Games</CardTitle>
              <CardDescription>Games selected for the Eid-Al-Athletes competition</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="rounded-md border">
                  <div className="hidden md:grid md:grid-cols-5 p-4 font-medium">
                    <div>Game</div>
                    <div>Type</div>
                    <div>Schedule Status</div>
                    <div>Points Value</div>
                    <div className="text-right">Actions</div>
                  </div>
                  <div className="divide-y">
                    {games
                      .filter((game) => game.status === "scheduled" || game.status === "completed")
                      .map((game, i) => {
                        const gameType = game.type || "Team Sport"
                        return (
                          <div
                            key={game._id}
                            className="flex flex-col md:grid md:grid-cols-5 p-4 gap-2 md:gap-0 md:items-center"
                          >
                            <div className="flex items-center justify-between w-full md:justify-start md:w-auto">
                              <div className="text-sm font-medium">{game.name}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 md:hidden">
                              <div className="text-xs text-muted-foreground">Type:</div>
                              <div className="text-sm">{gameType}</div>

                              <div className="text-xs text-muted-foreground">Schedule Status:</div>
                              <div>
                                <Badge
                                  variant={game.status === "completed" ? "success" : "default"}
                                  className="text-xs"
                                >
                                  {game.status === "completed" ? "Completed" : "Scheduled"}
                                </Badge>
                              </div>

                              <div className="text-xs text-muted-foreground">Points Value:</div>
                              <div className="text-sm">{game.pointsValue || ((i % 3) + 1) * 100} pts</div>
                            </div>
                            <div className="hidden md:block text-sm">{gameType}</div>
                            <div className="hidden md:block">
                              <Badge variant={game.status === "completed" ? "success" : "default"} className="text-xs">
                                {game.status === "completed" ? "Completed" : "Scheduled"}
                              </Badge>
                            </div>
                            <div className="hidden md:block text-sm">{game.pointsValue || ((i % 3) + 1) * 100} pts</div>
                            <div className="hidden md:flex justify-end gap-2">
                              <SelectedGameActions game={game} />
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

        <TabsContent value="scheduled" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Games</CardTitle>
              <CardDescription>Games that have been scheduled for the competition</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="rounded-md border">
                  <div className="hidden md:grid md:grid-cols-6 p-4 font-medium">
                    <div>Game</div>
                    <div>Date</div>
                    <div>Time</div>
                    <div>Teams</div>
                    <div>Location</div>
                    <div className="text-right">Actions</div>
                  </div>
                  <div className="divide-y">
                    {games
                      .filter((game) => game.status === "scheduled")
                      .map((game, i) => {
                        const gameDate = game.date ? new Date(game.date) : new Date(`2025-06-${15 + i}`)

                        return (
                          <div
                            key={game._id}
                            className="flex flex-col md:grid md:grid-cols-6 p-4 gap-2 md:gap-0 md:items-center"
                          >
                            <div className="flex items-center justify-between w-full md:justify-start md:w-auto">
                              <div className="text-sm font-medium">{game.name}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 md:hidden">
                              <div className="text-xs text-muted-foreground">Date:</div>
                              <div className="text-sm">
                                {gameDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </div>

                              <div className="text-xs text-muted-foreground">Time:</div>
                              <div className="text-sm">{`${1 + (i % 3)}:00 PM`}</div>

                              <div className="text-xs text-muted-foreground">Teams:</div>
                              <div className="text-sm">
                                {game.team1 === "team1"
                                  ? "Mountain Goats"
                                  : game.team1 === "team2"
                                    ? "Royal Rams"
                                    : game.team1 === "team3"
                                      ? "Athletic Antelopes"
                                      : game.team1 === "team4"
                                        ? "Speed Sheep"
                                        : `Team ${(i % 8) + 1}`}
                                {" vs "}
                                {game.team2 === "team1"
                                  ? "Mountain Goats"
                                  : game.team2 === "team2"
                                    ? "Royal Rams"
                                    : game.team2 === "team3"
                                      ? "Athletic Antelopes"
                                      : game.team2 === "team4"
                                        ? "Speed Sheep"
                                        : `Team ${((i + 4) % 8) + 1}`}
                              </div>

                              <div className="text-xs text-muted-foreground">Location:</div>
                              <div className="text-sm">{game.location || "Main Arena"}</div>
                            </div>
                            <div className="hidden md:block text-sm">
                              {gameDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </div>
                            <div className="hidden md:block text-sm">{`${1 + (i % 3)}:00 PM`}</div>
                            <div className="hidden md:block text-sm">
                              {game.team1 === "team1"
                                ? "Mountain Goats"
                                : game.team1 === "team2"
                                  ? "Royal Rams"
                                  : game.team1 === "team3"
                                    ? "Athletic Antelopes"
                                    : game.team1 === "team4"
                                      ? "Speed Sheep"
                                      : `Team ${(i % 8) + 1}`}
                              {" vs "}
                              {game.team2 === "team1"
                                ? "Mountain Goats"
                                : game.team2 === "team2"
                                  ? "Royal Rams"
                                  : game.team2 === "team3"
                                    ? "Athletic Antelopes"
                                    : game.team2 === "team4"
                                      ? "Speed Sheep"
                                      : `Team ${((i + 4) % 8) + 1}`}
                            </div>
                            <div className="hidden md:block text-sm">{game.location || "Main Arena"}</div>
                            <div className="hidden md:flex justify-end gap-2">
                              <ScheduledGameActions game={game} />
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

        <TabsContent value="completed" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Completed Games</CardTitle>
              <CardDescription>Games that have been completed with results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="rounded-md border">
                  <div className="hidden md:grid md:grid-cols-6 p-4 font-medium">
                    <div>Game</div>
                    <div>Date</div>
                    <div>Teams</div>
                    <div>Result</div>
                    <div>Points Awarded</div>
                    <div className="text-right">Actions</div>
                  </div>
                  <div className="divide-y">
                    {games
                      .filter((game) => game.status === "completed")
                      .map((game, i) => (
                        <div
                          key={game._id}
                          className="flex flex-col md:grid md:grid-cols-6 p-4 gap-2 md:gap-0 md:items-center"
                        >
                          <div className="flex items-center justify-between w-full md:justify-start md:w-auto">
                            <div className="text-sm font-medium">{game.name}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 md:hidden">
                            <div className="text-xs text-muted-foreground">Date:</div>
                            <div className="text-sm">
                              {new Date(game.date || `2025-06-${15 + i}`).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </div>

                            <div className="text-xs text-muted-foreground">Teams:</div>
                            <div className="text-sm">
                              {game.team1 === "team1"
                                ? "Mountain Goats"
                                : game.team1 === "team2"
                                  ? "Royal Rams"
                                  : game.team1 === "team3"
                                    ? "Athletic Antelopes"
                                    : game.team1 === "team4"
                                      ? "Speed Sheep"
                                      : `Team ${(i % 8) + 1}`}
                              {" vs "}
                              {game.team2 === "team1"
                                ? "Mountain Goats"
                                : game.team2 === "team2"
                                  ? "Royal Rams"
                                  : game.team2 === "team3"
                                    ? "Athletic Antelopes"
                                    : game.team2 === "team4"
                                      ? "Speed Sheep"
                                      : `Team ${((i + 4) % 8) + 1}`}
                            </div>

                            <div className="text-xs text-muted-foreground">Result:</div>
                            <div className="text-sm">
                              {game.score1}-{game.score2}
                            </div>

                            <div className="text-xs text-muted-foreground">Points Awarded:</div>
                            <div className="text-sm">{game.pointsValue || ((i % 3) + 1) * 100} pts</div>
                          </div>
                          <div className="hidden md:block text-sm">
                            {new Date(game.date || `2025-06-${15 + i}`).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div className="hidden md:block text-sm">
                            {game.team1 === "team1"
                              ? "Mountain Goats"
                              : game.team1 === "team2"
                                ? "Royal Rams"
                                : game.team1 === "team3"
                                  ? "Athletic Antelopes"
                                  : game.team1 === "team4"
                                    ? "Speed Sheep"
                                    : `Team ${(i % 8) + 1}`}
                            {" vs "}
                            {game.team2 === "team1"
                              ? "Mountain Goats"
                              : game.team2 === "team2"
                                ? "Royal Rams"
                                : game.team2 === "team3"
                                  ? "Athletic Antelopes"
                                  : game.team2 === "team4"
                                    ? "Speed Sheep"
                                    : `Team ${((i + 4) % 8) + 1}`}
                          </div>
                          <div className="hidden md:block text-sm">
                            {game.score1}-{game.score2}
                          </div>
                          <div className="hidden md:block text-sm">{game.pointsValue || ((i % 3) + 1) * 100} pts</div>
                          <div className="hidden md:flex justify-end gap-2">
                            <CompletedGameActions game={game} />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggested" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Suggested Games</CardTitle>
                  <CardDescription>Games suggested by users for future competitions</CardDescription>
                </div>
                <SuggestGameDialog />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="rounded-md border">
                  <div className="hidden md:grid md:grid-cols-5 p-4 font-medium">
                    <div>Game</div>
                    <div>Type</div>
                    <div>Votes</div>
                    <div>Status</div>
                    <div className="text-right">Actions</div>
                  </div>
                  <div className="divide-y">
                    {suggestedGames.map((game) => {
                      const gameType = game.type || "Team Sport"
                      return (
                        <div
                          key={game._id}
                          className="flex flex-col md:grid md:grid-cols-5 p-4 gap-2 md:gap-0 md:items-center"
                        >
                          <div className="flex items-center justify-between w-full md:justify-start md:w-auto">
                            <div className="text-sm font-medium">{game.name}</div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 md:hidden">
                            <div className="text-xs text-muted-foreground">Type:</div>
                            <div className="text-sm">{gameType}</div>

                            <div className="text-xs text-muted-foreground">Votes:</div>
                            <div className="text-sm">{game.votes}</div>

                            <div className="text-xs text-muted-foreground">Status:</div>
                            <div>
                              <Badge variant="outline" className="text-xs">
                                Suggested
                              </Badge>
                            </div>
                          </div>
                          <div className="hidden md:block text-sm">{gameType}</div>
                          <div className="hidden md:block text-sm">{game.votes}</div>
                          <div className="hidden md:block">
                            <Badge variant="outline" className="text-xs">
                              Suggested
                            </Badge>
                          </div>
                          <div className="hidden md:flex justify-end gap-2">
                            {isAdmin ? (
                              <Button variant="outline" size="sm">
                                <Check className="h-4 w-4 mr-1" />
                                Add to Pool
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleVote(game._id)}
                                disabled={game.userVoted}
                              >
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                {game.userVoted ? "Voted" : "Vote"}
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              View
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
      </Tabs>

      {/* Game Details Modal */}
      <GameDetailsModal gameId={selectedGameId} open={gameDetailsOpen} onOpenChange={setGameDetailsOpen} />
    </div>
  )
}

function SuggestGameDialog() {
  const { data: session } = useSession()
  const user = session?.user
  const [open, setOpen] = useState(false)
  const [gameName, setGameName] = useState("")
  const [gameType, setGameType] = useState("")
  const [description, setDescription] = useState("")
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to suggest games.",
        variant: "destructive",
      })
      return
    }

    // In a real implementation, this would call an API endpoint
    toast({
      title: "Game suggested",
      description: `Your game "${gameName}" has been suggested. Others can now vote on it.`,
    })
    setGameName("")
    setGameType("")
    setDescription("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Suggest Game
        </Button>
      </DialogTrigger>
      <DialogContent className="animate-in fade-in-50 slide-in-from-bottom-10 duration-300">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Suggest New Game</DialogTitle>
            <DialogDescription>
              Suggest a new game for future competitions. Other users can vote on your suggestion.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="game-name" className="text-right">
                Game Name
              </Label>
              <Input
                id="game-name"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="game-type" className="text-right">
                Game Type
              </Label>
              <Select value={gameType} onValueChange={setGameType}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a game type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Team Sport">Team Sport</SelectItem>
                  <SelectItem value="Individual">Individual</SelectItem>
                  <SelectItem value="Relay">Relay</SelectItem>
                  <SelectItem value="Strategy">Strategy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                rows={3}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Submit Suggestion</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Client components for RBAC
function AdminOnlyCheckbox({ id, checked }: { id: string; checked?: boolean }) {
  const { data: session } = useSession()
  const user = session?.user
  const isAdmin = user?.role === "admin"
  
  if (!isAdmin) return null
  
  return <Checkbox id={id} checked={checked} />
}

function AdminOnlySaveButton() {
  const { data: session } = useSession()
  const user = session?.user
  const isAdmin = user?.role === "admin"
  
  if (!isAdmin) return null
  
  return (
    <Button size="sm">
      <Check className="h-4 w-4 mr-2" /> Save Changes
    </Button>
  )
}

// Update GameActions to include onView prop
function GameActions({ game, onView }: { game: any; onView: (gameId: string) => void }) {
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
      <Button variant="ghost" size="sm" onClick={() => onView(game._id)}>
        View
      </Button>
    </>
  )
}

function SelectedGameActions({ game }: { game: any }) {
  const { data: session } = useSession()
  const user = session?.user
  const isAdmin = user?.role === "admin"
  const isScheduled = game.status === "scheduled"

  return (
    <>
      <Button variant="outline" size="sm">
        {isScheduled ? "View Schedule" : isAdmin ? "Schedule" : "View Details"}
      </Button>
      {isAdmin && (
        <Button variant="ghost" size="sm">
          Remove
        </Button>
      )}
    </>
  )
}

function ScheduledGameActions({ game }: { game: any }) {
  const { data: session } = useSession()
  const user = session?.user
  const isAdmin = user?.role === "admin"
  const isCaptain = user?.role === "captain" && (user?.teamId === game.team1 || user?.teamId === game.team2)

  return (
    <>
      <Button variant="outline" size="sm">
        {isAdmin || isCaptain ? "Manage Players" : "View Details"}
      </Button>
      {isAdmin && (
        <Button variant="ghost" size="sm">
          Edit
        </Button>
      )}
    </>
  )
}

function CompletedGameActions({ game }: { game: any }) {
  const { data: session } = useSession()
  const user = session?.user
  const isAdmin = user?.role === "admin"

  return (
    <>
      <Button variant="outline" size="sm">
        View Details
      </Button>
      {isAdmin && (
        <Button variant="ghost" size="sm">
          Edit
        </Button>
      )}
    </>
  )
}

