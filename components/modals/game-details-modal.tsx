"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, MapPinIcon, Trophy, Clock } from "lucide-react"
import { getGameDetails, getTeamName } from "@/lib/data"
import { Separator } from "@/components/ui/separator"

interface GameDetailsModalProps {
  gameId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GameDetailsModal({ gameId, open, onOpenChange }: GameDetailsModalProps) {
  const [game, setGame] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [team1Name, setTeam1Name] = useState<string>("")
  const [team2Name, setTeam2Name] = useState<string>("")

  useEffect(() => {
    async function loadGameDetails() {
      if (!gameId) return

      setLoading(true)
      setError(null)

      try {
        const gameData = await getGameDetails(gameId)
        setGame(gameData)

        // Get team names if they exist
        if (gameData.team1) {
          const name = await getTeamName(gameData.team1)
          setTeam1Name(name)
        }
        if (gameData.team2) {
          const name = await getTeamName(gameData.team2)
          setTeam2Name(name)
        }
      } catch (err) {
        console.error("Failed to load game details:", err)
        setError("Failed to load game details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (open && gameId) {
      loadGameDetails()
    }
  }, [open, gameId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Completed</Badge>
      case "scheduled":
        return <Badge>Scheduled</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            <p>{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        ) : game ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">{game.name}</DialogTitle>
              <DialogDescription>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(game.status)}
                  <Badge variant="outline">{game.type || "Team Sport"}</Badge>
                  {game.pointsValue && <Badge variant="secondary">{game.pointsValue} points</Badge>}
                </div>
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Date, Time, Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{game.date ? formatDate(game.date) : "Date TBD"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{game.date ? formatTime(game.date) : "Time TBD"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{game.location || "Location TBD"}</span>
                </div>
              </div>

              <Separator />

              {/* Teams */}
              {(game.team1 || game.team2) && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Teams</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col items-center">
                        <Avatar className="h-12 w-12 mb-2">
                          <AvatarImage
                            src={`/placeholder.svg?height=48&width=48&text=${team1Name.substring(0, 2)}`}
                            alt={team1Name}
                          />
                          <AvatarFallback>{team1Name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                          <p className="font-medium">{team1Name}</p>
                          {game.status === "completed" && <p className="text-2xl font-bold">{game.score1}</p>}
                        </div>
                      </div>

                      {game.status === "completed" ? (
                        <div className="flex flex-col items-center">
                          <span className="text-sm text-muted-foreground mb-2">Final Score</span>
                          <Trophy className="h-6 w-6 text-amber-500" />
                        </div>
                      ) : (
                        <span className="text-xl font-bold">vs</span>
                      )}

                      <div className="flex flex-col items-center">
                        <Avatar className="h-12 w-12 mb-2">
                          <AvatarImage
                            src={`/placeholder.svg?height=48&width=48&text=${team2Name.substring(0, 2)}`}
                            alt={team2Name}
                          />
                          <AvatarFallback>{team2Name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                          <p className="font-medium">{team2Name}</p>
                          {game.status === "completed" && <p className="text-2xl font-bold">{game.score2}</p>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Game Description */}
              {game.description && (
                <div>
                  <h3 className="font-medium mb-1">Description</h3>
                  <p className="text-sm text-muted-foreground">{game.description}</p>
                </div>
              )}

              {/* Rules */}
              {game.rules && (
                <div>
                  <h3 className="font-medium mb-1">Rules</h3>
                  <p className="text-sm text-muted-foreground">{game.rules}</p>
                </div>
              )}

              {/* Players */}
              {game.players && game.players.length > 0 && (
                <div>
                  <h3 className="font-medium mb-1">Players</h3>
                  <div className="flex flex-wrap gap-2">
                    {game.players.map((player: any) => (
                      <Badge key={player.id} variant="outline">
                        {player.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">No game details available</div>
        )}
      </DialogContent>
    </Dialog>
  )
}

