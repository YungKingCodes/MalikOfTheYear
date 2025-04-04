"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ThumbsUp, ThumbsDown, Save, Trophy, CalendarDays, MapPin } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Player {
  id: string
  name: string
  avatar: string
  feedback?: {
    rating: "positive" | "negative"
    comment: string
    accolades: string[]
  }
}

interface GameDetails {
  id: string
  name: string
  date: string
  location: string
  type: string
  status: string
  result?: {
    team1Score: number
    team2Score: number
    winner: string
  }
}

// Available accolades that can be awarded
const AVAILABLE_ACCOLADES = [
  "Sharpshooter",
  "Team Player",
  "Defensive Wall",
  "Tireless Runner",
  "Speed Demon",
  "Clutch Performer",
  "Mastermind",
  "MVP",
  "Most Improved",
  "Leadership",
  "Good Sport",
  "Quick Learner",
]

export function CaptainGameReview({ gameId }: { gameId: string }) {
  const { data: session } = useSession()
  const user = session?.user
  const { toast } = useToast()
  const router = useRouter()
  const [game, setGame] = useState<GameDetails | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [reviewCompleted, setReviewCompleted] = useState(false)

  // Load game details and players
  useEffect(() => {
    const loadGameData = async () => {
      setLoading(true)
      try {
        // In a real app, fetch from API
        // For now, use mock data

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Mock game data
        const mockGame: GameDetails = {
          id: gameId,
          name: "Basketball Tournament",
          date: "2025-06-15T14:00:00Z",
          location: "Main Arena",
          type: "Team Sport",
          status: "completed",
          result: {
            team1Score: 78,
            team2Score: 72,
            winner: "team1", // Mountain Goats
          },
        }

        // Mock players data
        const mockPlayers: Player[] = [
          {
            id: "player1",
            name: "Regular Player",
            avatar: "RP",
            feedback: {
              rating: "positive",
              comment: "Great defensive work!",
              accolades: ["Defensive Wall"],
            },
          },
          {
            id: "player2",
            name: "Emily Rodriguez",
            avatar: "ER",
          },
          {
            id: "player3",
            name: "David Kim",
            avatar: "DK",
          },
          {
            id: "player4",
            name: "James Wilson",
            avatar: "JW",
          },
          {
            id: "player5",
            name: "Lisa Thompson",
            avatar: "LT",
          },
        ]

        setGame(mockGame)
        setPlayers(mockPlayers)

        // Check if review is already completed
        const hasAllFeedback = mockPlayers.every((player) => player.feedback)
        setReviewCompleted(hasAllFeedback)
      } catch (error) {
        console.error("Failed to load game data:", error)
        toast({
          title: "Error",
          description: "Failed to load game data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (user?.role === "captain") {
      loadGameData()
    } else {
      toast({
        title: "Permission Denied",
        description: "Only team captains can review games.",
        variant: "destructive",
      })
      router.push(`/games/${gameId}`)
    }
  }, [gameId, user, toast, router])

  // Handle player feedback change
  const handleFeedbackChange = (playerId: string, field: string, value: any) => {
    setPlayers((prev) =>
      prev.map((player) => {
        if (player.id === playerId) {
          return {
            ...player,
            feedback: {
              ...(player.feedback || { rating: "positive", comment: "", accolades: [] }),
              [field]: value,
            },
          }
        }
        return player
      }),
    )
  }

  // Handle accolade selection
  const handleAccoladeChange = (playerId: string, accolade: string) => {
    setPlayers((prev) =>
      prev.map((player) => {
        if (player.id === playerId) {
          const currentAccolades = player.feedback?.accolades || []

          // If already selected, remove it; otherwise add it
          const newAccolades = currentAccolades.includes(accolade)
            ? currentAccolades.filter((a) => a !== accolade)
            : [...currentAccolades, accolade]

          return {
            ...player,
            feedback: {
              ...(player.feedback || { rating: "positive", comment: "", accolades: [] }),
              accolades: newAccolades,
            },
          }
        }
        return player
      }),
    )
  }

  // Handle save
  const handleSave = async () => {
    setSaving(true)
    try {
      // In a real app, save to API
      // For now, just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Review Submitted",
        description: "Your feedback has been saved successfully.",
      })

      setReviewCompleted(true)

      // Navigate back to game details
      setTimeout(() => {
        router.push(`/games/${gameId}`)
      }, 1500)
    } catch (error) {
      console.error("Failed to save review:", error)
      toast({
        title: "Error",
        description: "Failed to save your review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold mb-2">Game Not Found</h2>
        <p className="text-muted-foreground">The requested game could not be found.</p>
        <Button className="mt-4" onClick={() => router.push("/games")}>
          Back to Games
        </Button>
      </div>
    )
  }

  if (reviewCompleted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">Review Completed</CardTitle>
          <CardDescription>You have already reviewed all players for this game.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Your feedback has been recorded and is visible to the players.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push(`/games/${gameId}`)}>Back to Game Details</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">{game.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <CalendarDays className="h-4 w-4" />
                {new Date(game.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                <span className="mx-1">•</span>
                <MapPin className="h-4 w-4" />
                {game.location}
              </CardDescription>
            </div>
            <Badge className="self-start md:self-center">
              {game.result?.winner === "team1" ? "Won" : "Lost"} {game.result?.team1Score}-{game.result?.team2Score}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Please provide feedback for each player who participated in this game. Your feedback will help players
            understand their strengths and areas for improvement.
          </p>
        </CardContent>
      </Card>

      {players.map((player) => (
        <Card key={player.id} className="border-muted">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${player.avatar}`} alt={player.name} />
                <AvatarFallback>{player.avatar}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-lg">{player.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button
                variant={player.feedback?.rating === "positive" ? "default" : "outline"}
                size="sm"
                className="gap-2"
                onClick={() => handleFeedbackChange(player.id, "rating", "positive")}
              >
                <ThumbsUp className="h-4 w-4" />
                Positive
              </Button>
              <Button
                variant={player.feedback?.rating === "negative" ? "default" : "outline"}
                size="sm"
                className="gap-2"
                onClick={() => handleFeedbackChange(player.id, "rating", "negative")}
              >
                <ThumbsDown className="h-4 w-4" />
                Negative
              </Button>
            </div>

            <div className="space-y-2">
              <label htmlFor={`comment-${player.id}`} className="text-sm font-medium">
                Feedback Comment
              </label>
              <Textarea
                id={`comment-${player.id}`}
                placeholder="Provide specific feedback about this player's performance..."
                value={player.feedback?.comment || ""}
                onChange={(e) => handleFeedbackChange(player.id, "comment", e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Award Accolades</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_ACCOLADES.map((accolade) => {
                  const isSelected = player.feedback?.accolades?.includes(accolade) || false
                  return (
                    <Badge
                      key={accolade}
                      variant={isSelected ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleAccoladeChange(player.id, accolade)}
                    >
                      {isSelected && <Trophy className="h-3 w-3 mr-1" />}
                      {accolade}
                    </Badge>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.push(`/games/${gameId}`)}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Submit Review
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

