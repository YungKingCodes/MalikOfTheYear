"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Filter, ThumbsUp, Check, CloudRain } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { getGames } from "@/lib/data"
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

interface Game {
  _id: string
  name: string
  type: string
  date?: string
  team1?: string
  team2?: string
  score1?: number
  score2?: number
  status: string
  location?: string
  pointsValue?: number
  competitionId?: string
  votes?: number
  suggested?: boolean
  backupPlan?: string
}

export function GamesTab() {
  const [games, setGames] = useState<Game[]>([])
  const [suggestedGames, setSuggestedGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()
  const user = session?.user
  const isAdmin = user?.role === "admin"

  useEffect(() => {
    async function loadGames() {
      try {
        setLoading(true)
        const gamesData = await getGames()

        // Separate suggested games from regular games
        // In a real implementation, this would come from the API
        const mockSuggestedGames: Game[] = [
          {
            _id: "suggestion1",
            name: "Tug of War",
            type: "Team Sport",
            status: "suggested",
            votes: 12,
            suggested: true,
          },
          {
            _id: "suggestion2",
            name: "Chess Tournament",
            type: "Strategy",
            status: "suggested",
            votes: 8,
            suggested: true,
          },
          {
            _id: "suggestion3",
            name: "Archery Competition",
            type: "Individual",
            status: "suggested",
            votes: 5,
            suggested: true,
          },
        ]

        setGames(gamesData)
        setSuggestedGames(mockSuggestedGames)
      } catch (err) {
        console.error("Failed to load games:", err)
        setError("Failed to load games. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadGames()
  }, [])

  if (loading) {
    return <div className="py-4 text-center text-muted-foreground">Loading games...</div>
  }

  if (error) {
    return <div className="py-4 text-center text-destructive">{error}</div>
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Games</h2>
          <p className="text-muted-foreground">Manage games, schedule events, and track results</p>
        </div>
        <div className="flex items-center gap-2">{isAdmin ? <AddGameDialog /> : <SuggestGameDialog />}</div>
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
                    {games.map((game, i) => {
                      const isSelected = game.status === "scheduled" || game.status === "completed"
                      const gameTypes = ["Team Sport", "Individual", "Relay", "Strategy"]
                      const gameType = game.type || gameTypes[i % gameTypes.length]

                      return (
                        <div key={game._id} className="grid grid-cols-6 p-4 items-center">
                          <div className="flex items-center gap-2">
                            {isAdmin && <Checkbox id={`game-${i}`} checked={isSelected} />}
                            <label htmlFor={`game-${i}`} className="text-sm font-medium">
                              {game.name}
                            </label>
                          </div>
                          <div className="text-sm">{gameType}</div>
                          <div className="text-sm">
                            {gameType === "Team Sport" ? "Team" : gameType === "Relay" ? "4-8 players" : "Individual"}
                          </div>
                          <div className="text-sm">{30 + (i % 3) * 15} min</div>
                          <div>
                            <Badge variant={isSelected ? "default" : "outline"} className="text-xs">
                              {isSelected ? "Selected 2025" : "Available"}
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
                      )
                    })}
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex justify-end">
                    <Button>Save Selection</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="selected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>2025 Selected Games</CardTitle>
              <CardDescription>Games selected for the Eid-Al-Athletes competition</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="rounded-md border">
                  <div className="grid grid-cols-6 p-4 font-medium">
                    <div>Game</div>
                    <div>Type</div>
                    <div>Schedule Status</div>
                    <div>Points Value</div>
                    <div>Backup Plan</div>
                    <div className="text-right">Actions</div>
                  </div>
                  <div className="divide-y">
                    {games
                      .filter((game) => game.status === "scheduled" || game.status === "completed")
                      .map((game, i) => (
                        <div key={game._id} className="grid grid-cols-6 p-4 items-center">
                          <div className="text-sm font-medium">{game.name}</div>
                          <div className="text-sm">{game.type}</div>
                          <div>
                            <Badge variant={game.status === "completed" ? "success" : "default"} className="text-xs">
                              {game.status === "completed" ? "Completed" : "Scheduled"}
                            </Badge>
                          </div>
                          <div className="text-sm">{game.pointsValue || ((i % 3) + 1) * 100} pts</div>
                          <div className="text-sm">
                            {i % 2 === 0 ? (
                              <span className="flex items-center text-green-600">
                                <Check className="h-3 w-3 mr-1" />
                                Set
                              </span>
                            ) : (
                              <span className="flex items-center text-amber-600">
                                <CloudRain className="h-3 w-3 mr-1" />
                                Needed
                              </span>
                            )}
                          </div>
                          <div className="flex justify-end gap-2">
                            {isAdmin && (
                              <>
                                <Button variant="outline" size="sm">
                                  {game.status === "completed" ? "View Results" : "Schedule"}
                                </Button>
                                {i % 2 !== 0 && <AddBackupPlanDialog gameId={game._id} gameName={game.name} />}
                              </>
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

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Games</CardTitle>
              <CardDescription>Games that have been scheduled for the competition</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="rounded-md border">
                  <div className="grid grid-cols-6 p-4 font-medium">
                    <div>Game</div>
                    <div>Date</div>
                    <div>Time</div>
                    <div>Teams</div>
                    <div>Location</div>
                    <div className="text-right">Actions</div>
                  </div>
                  <div className="divide-y">
                    {games
                      .filter((game) => game.status === "scheduled" || game.status === "completed")
                      .map((game, i) => {
                        const isCompleted = game.status === "completed"
                        const gameDate = game.date ? new Date(game.date) : new Date(`2025-06-${15 + i}`)

                        return (
                          <div key={game._id} className="grid grid-cols-6 p-4 items-center">
                            <div className="text-sm font-medium">{game.name}</div>
                            <div className="text-sm">
                              {gameDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                            </div>
                            <div className="text-sm">{`${1 + (i % 3)}:00 PM`}</div>
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
                            <div className="text-sm">{game.location || "Main Arena"}</div>
                            <div className="flex justify-end gap-2">
                              {isAdmin && (
                                <Button variant="outline" size="sm">
                                  {isCompleted ? "View Results" : "Record Results"}
                                </Button>
                              )}
                              <Button variant="ghost" size="sm">
                                {isAdmin ? "Edit" : "View"}
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

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Games</CardTitle>
              <CardDescription>Games that have been completed with results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="rounded-md border">
                  <div className="grid grid-cols-6 p-4 font-medium">
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
                      .map((game, i) => {
                        const gameDate = game.date ? new Date(game.date) : new Date(`2025-06-${15 + i}`)

                        return (
                          <div key={game._id} className="grid grid-cols-6 p-4 items-center">
                            <div className="text-sm font-medium">{game.name}</div>
                            <div className="text-sm">
                              {gameDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                            </div>
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
                            <div className="text-sm">
                              {game.score1}-{game.score2}
                            </div>
                            <div className="text-sm">{game.pointsValue || ((i % 3) + 1) * 100} pts</div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                              {isAdmin && (
                                <Button variant="ghost" size="sm">
                                  Edit
                                </Button>
                              )}
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

        <TabsContent value="suggested" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Suggested Games</CardTitle>
              <CardDescription>Games suggested by users for future competitions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 p-4 font-medium">
                    <div>Game</div>
                    <div>Type</div>
                    <div>Votes</div>
                    <div>Status</div>
                    <div className="text-right">Actions</div>
                  </div>
                  <div className="divide-y">
                    {suggestedGames.map((game, i) => (
                      <div key={game._id} className="grid grid-cols-5 p-4 items-center">
                        <div className="text-sm font-medium">{game.name}</div>
                        <div className="text-sm">{game.type}</div>
                        <div className="text-sm">{game.votes}</div>
                        <div>
                          <Badge variant="outline" className="text-xs">
                            Suggested
                          </Badge>
                        </div>
                        <div className="flex justify-end gap-2">
                          {isAdmin ? (
                            <Button variant="outline" size="sm">
                              <Check className="h-4 w-4 mr-1" />
                              Add to Pool
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm">
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              Vote
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
      </Tabs>
    </>
  )
}

function AddGameDialog() {
  const [open, setOpen] = useState(false)
  const [gameName, setGameName] = useState("")
  const [gameType, setGameType] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real implementation, this would call an API endpoint
    alert(`Game "${gameName}" would be added`)
    setGameName("")
    setGameType("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Game
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Game</DialogTitle>
            <DialogDescription>Add a new game to the game pool.</DialogDescription>
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
              <Label htmlFor="points-value" className="text-right">
                Points Value
              </Label>
              <Input id="points-value" type="number" defaultValue="100" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Game</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function SuggestGameDialog() {
  const [open, setOpen] = useState(false)
  const [gameName, setGameName] = useState("")
  const [gameType, setGameType] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real implementation, this would call an API endpoint
    alert(`Game "${gameName}" has been suggested`)
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
      <DialogContent>
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

function AddBackupPlanDialog({ gameId, gameName }: { gameId: string; gameName: string }) {
  const [open, setOpen] = useState(false)
  const [backupPlan, setBackupPlan] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real implementation, this would call an API endpoint
    alert(`Backup plan added for "${gameName}"`)
    setBackupPlan("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <CloudRain className="h-4 w-4 mr-1" />
          Add Backup
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Rainy Day Backup</DialogTitle>
            <DialogDescription>
              Add a backup plan for {gameName} in case of bad weather or other issues.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="backup-plan" className="text-right">
                Backup Plan
              </Label>
              <Textarea
                id="backup-plan"
                value={backupPlan}
                onChange={(e) => setBackupPlan(e.target.value)}
                className="col-span-3"
                rows={4}
                placeholder="Describe the backup plan for this game..."
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="backup-location" className="text-right">
                Backup Location
              </Label>
              <Input id="backup-location" defaultValue="Indoor Arena" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save Backup Plan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

