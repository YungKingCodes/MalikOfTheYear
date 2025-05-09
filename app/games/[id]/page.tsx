"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, MapPin, Trophy } from "lucide-react"
import { GamePlayerAssignment } from "@/components/game-player-assignment"
import { GameReviewButton } from "@/components/games/game-review-button"
import { use } from "react"

// This would normally come from a database
const getGameDetails = (id: string) => {
  // Mock game data
  return {
    id,
    name: "Basketball Tournament",
    type: "Team Sport",
    date: "2025-06-15T14:00:00Z",
    location: "Main Arena",
    status: "completed",
    description:
      "A competitive basketball tournament between all teams. Points will be awarded based on final rankings.",
    pointsValue: 100,
    duration: "2 hours",
    rules: [
      "Standard basketball rules apply",
      "Games are 20 minutes each",
      "Teams will play in a round-robin format",
      "Top 4 teams advance to semifinals",
      "Winners of semifinals play in the final match",
    ],
    requiresAllPlayers: false,
    maxPlayers: 5,
    teams: [
      { id: "team1", name: "Mountain Goats" },
      { id: "team2", name: "Royal Rams" },
      { id: "team3", name: "Athletic Antelopes" },
      { id: "team4", name: "Speed Sheep" },
    ],
    result: {
      team1Score: 78,
      team2Score: 72,
      winner: "team1", // Mountain Goats
    },
  }
}

export default function GameDetailsPage({ params }: { params: { id: string } }) {
  const gameId = use(Promise.resolve(params.id))
  const game = getGameDetails(gameId)

  return (
    <div className="container py-8 space-y-8 animate-in fade-in-50 duration-500">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/games">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-secondary">{game.type}</Badge>
              <Badge variant={game.status === "completed" ? "default" : "outline"}>
                {game.status === "completed" ? "Completed" : "Scheduled"}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-primary">{game.name}</h1>
            <p className="text-muted-foreground">{game.description}</p>
          </div>

          <div className="flex gap-2">
            <Button className="bg-primary hover:bg-primary/90">View Schedule</Button>
            <GameReviewButton gameId={gameId} />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <Calendar className="w-10 h-10 text-primary" />
              <div>
                <p className="font-medium">Date & Time</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(game.date).toLocaleDateString()} at{" "}
                  {new Date(game.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <MapPin className="w-10 h-10 text-secondary" />
              <div>
                <p className="font-medium">Location</p>
                <p className="text-sm text-muted-foreground">{game.location}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <Trophy className="w-10 h-10 text-accent" />
              <div>
                <p className="font-medium">Points Value</p>
                <p className="text-sm text-muted-foreground">{game.pointsValue} points</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {game.status === "completed" && game.result && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Game Results</CardTitle>
              <CardDescription>Final scores and outcome</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-4">
                <div className="text-center">
                  <p className="text-lg font-medium">Mountain Goats</p>
                  <p className="text-4xl font-bold mt-2">{game.result.team1Score}</p>
                </div>
                <div className="text-center text-2xl font-bold text-muted-foreground">vs</div>
                <div className="text-center">
                  <p className="text-lg font-medium">Royal Rams</p>
                  <p className="text-4xl font-bold mt-2">{game.result.team2Score}</p>
                </div>
              </div>
              <div className="text-center mt-4">
                <Badge className="text-base px-4 py-1">
                  {game.result.winner === "team1" ? "Mountain Goats" : "Royal Rams"} Win!
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Game Details</CardTitle>
              <CardDescription>Information about this game</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p className="text-sm text-muted-foreground">{game.duration}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Player Requirement</p>
                  <p className="text-sm text-muted-foreground">
                    {game.requiresAllPlayers ? "All team members" : `Up to ${game.maxPlayers} players`}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Game Type</p>
                  <p className="text-sm text-muted-foreground">{game.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm text-muted-foreground capitalize">{game.status}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Participating Teams</p>
                <div className="flex flex-wrap gap-2">
                  {game.teams.map((team) => (
                    <Badge key={team.id} variant="outline" className="text-xs">
                      {team.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Game Rules</CardTitle>
              <CardDescription>Rules and guidelines for this game</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc pl-5">
                {game.rules.map((rule, index) => (
                  <li key={index} className="text-sm">
                    {rule}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div id="player-assignment">
          <GamePlayerAssignment
            gameId={game.id}
            gameName={game.name}
            gameDate={game.date}
            gameType={game.type}
            requiresAllPlayers={game.requiresAllPlayers}
            maxPlayers={game.maxPlayers}
          />
        </div>
      </div>
    </div>
  )
}

