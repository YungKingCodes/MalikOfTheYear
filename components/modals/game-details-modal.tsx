"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarIcon, MapPinIcon, Trophy, Clock, Users } from "lucide-react"
import { getGameById } from "@/app/actions/games"
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

  useEffect(() => {
    async function loadGameDetails() {
      if (!gameId) return

      setLoading(true)
      setError(null)

      try {
        const gameData = await getGameById(gameId)
        setGame(gameData)
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
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>
      case "scheduled":
        return <Badge>Scheduled</Badge>
      case "available": 
        return <Badge variant="outline">Available</Badge>
      case "selected":
        return <Badge variant="secondary">Selected</Badge>
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
            <DialogHeader className="sticky top-0 z-10 bg-background pt-0 pb-4">
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
              {/* Game Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Players: {game.playerCount || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Duration: {game.duration} minutes</span>
                </div>
              </div>
              
              {/* Date and Location (if scheduled) */}
              {game.date && (
                <>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(game.date)}, {formatTime(game.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{game.location || "Location TBD"}</span>
                    </div>
                  </div>
                </>
              )}
              
              <Separator />

              {/* Teams (if assigned) */}
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
                            src={`/placeholder.svg?height=48&width=48&text=${game.team1?.name?.substring(0, 2) || 'T1'}`}
                            alt={game.team1?.name || "Team 1"}
                          />
                          <AvatarFallback>{game.team1?.name?.substring(0, 2) || 'T1'}</AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                          <p className="font-medium">{game.team1?.name || "Team 1 TBD"}</p>
                          {game.status === "completed" && <p className="text-2xl font-bold">{game.score1 || 0}</p>}
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
                            src={`/placeholder.svg?height=48&width=48&text=${game.team2?.name?.substring(0, 2) || 'T2'}`}
                            alt={game.team2?.name || "Team 2"}
                          />
                          <AvatarFallback>{game.team2?.name?.substring(0, 2) || 'T2'}</AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                          <p className="font-medium">{game.team2?.name || "Team 2 TBD"}</p>
                          {game.status === "completed" && <p className="text-2xl font-bold">{game.score2 || 0}</p>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Game Description */}
              <div>
                <h3 className="font-medium mb-1">Description</h3>
                <p className="text-sm text-muted-foreground">{game.description || "No description available."}</p>
              </div>

              {/* Category */}
              <div>
                <h3 className="font-medium mb-1">Category</h3>
                <p className="text-sm text-muted-foreground">{game.category || "N/A"}</p>
              </div>

              {/* Backup Plan */}
              {game.backupPlan && (
                <div>
                  <h3 className="font-medium mb-1">Backup Plan</h3>
                  <p className="text-sm text-muted-foreground">{game.backupPlan}</p>
                </div>
              )}
              
              {/* Competition */}
              {game.competition && (
                <div>
                  <h3 className="font-medium mb-1">Competition</h3>
                  <p className="text-sm text-muted-foreground">{game.competition.name} {game.competition.year}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

