"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Filter } from "lucide-react"
import { getUsers } from "@/lib/data"
import { useSession } from "next-auth/react"
import { canViewPlayerScores } from "@/lib/auth-utils"
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

interface Player {
  _id: string
  name: string
  role: string
  teamId?: string
  proficiencyScore: number
  titles: string[]
  position: string
}

export function PlayersTab() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()
  const user = session?.user
  const isAdmin = user?.role === "admin"

  useEffect(() => {
    async function loadPlayers() {
      try {
        setLoading(true)
        const playersData = await getUsers()
        setPlayers(playersData)
      } catch (err) {
        console.error("Failed to load players:", err)
        setError("Failed to load players. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadPlayers()
  }, [])

  if (loading) {
    return <div className="py-4 text-center text-muted-foreground">Loading players...</div>
  }

  if (error) {
    return <div className="py-4 text-center text-destructive">{error}</div>
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Players</h2>
          <p className="text-muted-foreground">Manage player profiles, skills, and team assignments</p>
        </div>
        <div className="flex items-center gap-2">{isAdmin && <AddPlayerDialog />}</div>
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
              <div className="space-y-8">
                <div className="rounded-md border">
                  <div className="grid grid-cols-6 p-4 font-medium">
                    <div>Player</div>
                    <div>Team</div>
                    <div>Proficiency Score</div>
                    <div>Titles</div>
                    <div>Status</div>
                    <div className="text-right">Actions</div>
                  </div>
                  <div className="divide-y">
                    {players.map((player, i) => (
                      <div key={player._id} className="grid grid-cols-6 p-4 items-center">
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
                        <div className="text-sm">
                          {canViewPlayerScores(user, player.teamId) ? player.proficiencyScore : "Hidden"}
                        </div>
                        <div>
                          {player.titles && player.titles.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {player.titles[0]}
                            </Badge>
                          )}
                        </div>
                        <div>
                          <Badge variant={player.teamId ? "success" : "outline"} className="text-xs">
                            {player.teamId ? "Active" : "Pending"}
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

        <TabsContent value="unassigned" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Unassigned Players</CardTitle>
              <CardDescription>Players who have not been assigned to a team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 p-4 font-medium">
                    <div>Player</div>
                    <div>Proficiency Score</div>
                    <div>Titles</div>
                    <div>Status</div>
                    <div className="text-right">Actions</div>
                  </div>
                  <div className="divide-y">
                    {players
                      .filter((player) => !player.teamId)
                      .map((player, i) => (
                        <div key={player._id} className="grid grid-cols-5 p-4 items-center">
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
                          <div className="text-sm">
                            {canViewPlayerScores(user, player.teamId) ? player.proficiencyScore : "Hidden"}
                          </div>
                          <div>
                            {player.titles && player.titles.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {player.titles[0]}
                              </Badge>
                            )}
                          </div>
                          <div>
                            <Badge variant="outline" className="text-xs">
                              Pending
                            </Badge>
                          </div>
                          <div className="flex justify-end gap-2">
                            {isAdmin && (
                              <Button variant="outline" size="sm">
                                Assign
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

        <TabsContent value="captains" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Captains</CardTitle>
              <CardDescription>Players who are currently serving as team captains</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 p-4 font-medium">
                    <div>Captain</div>
                    <div>Team</div>
                    <div>Proficiency Score</div>
                    <div>Titles</div>
                    <div className="text-right">Actions</div>
                  </div>
                  <div className="divide-y">
                    {players
                      .filter((player) => player.position === "Captain")
                      .map((player, i) => (
                        <div key={player._id} className="grid grid-cols-5 p-4 items-center">
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
                              <p className="text-xs text-muted-foreground">Since June 1, 2025</p>
                            </div>
                          </div>
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
                          <div className="text-sm">
                            {canViewPlayerScores(user, player.teamId) ? player.proficiencyScore : "Hidden"}
                          </div>
                          <div>
                            {player.titles && player.titles.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {player.titles[0]}
                              </Badge>
                            )}
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

        <TabsContent value="titled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Titled Players</CardTitle>
              <CardDescription>Players who have earned titles in previous competitions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 p-4 font-medium">
                    <div>Player</div>
                    <div>Team</div>
                    <div>Titles</div>
                    <div>Year Earned</div>
                    <div className="text-right">Actions</div>
                  </div>
                  <div className="divide-y">
                    {players
                      .filter((player) => player.titles && player.titles.length > 0)
                      .map((player, i) => (
                        <div key={player._id} className="grid grid-cols-5 p-4 items-center">
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
                          <div>
                            {player.titles.map((title, index) => (
                              <Badge key={index} variant="secondary" className="text-xs mr-1">
                                {title}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-sm">{player.titles[0].includes("'24") ? "2024" : "2023"}</div>
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
      </Tabs>
    </>
  )
}

function AddPlayerDialog() {
  const [open, setOpen] = useState(false)
  const [playerName, setPlayerName] = useState("")
  const [playerEmail, setPlayerEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real implementation, this would call an API endpoint
    alert(`Player "${playerName}" would be added`)
    setPlayerName("")
    setPlayerEmail("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Player
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Player</DialogTitle>
            <DialogDescription>Add a new player to the competition.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="player-name" className="text-right">
                Name
              </Label>
              <Input
                id="player-name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="player-email" className="text-right">
                Email
              </Label>
              <Input
                id="player-email"
                type="email"
                value={playerEmail}
                onChange={(e) => setPlayerEmail(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="team" className="text-right">
                Team
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a team (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="team1">Mountain Goats</SelectItem>
                  <SelectItem value="team2">Royal Rams</SelectItem>
                  <SelectItem value="team3">Athletic Antelopes</SelectItem>
                  <SelectItem value="team4">Speed Sheep</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Player</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

