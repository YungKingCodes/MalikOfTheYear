"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUserById, getTeamName } from "@/lib/data"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { useSession } from "next-auth/react"
import { canViewPlayerScores } from "@/lib/auth-utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Trophy, Medal, Star } from "lucide-react"
import { PlayerProficiencyChartSmall } from "@/components/player-profile/proficiency-chart-small"

interface PlayerDetailsModalProps {
  playerId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PlayerDetailsModal({ playerId, open, onOpenChange }: PlayerDetailsModalProps) {
  const { data: session } = useSession()
  const user = session?.user
  const [player, setPlayer] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [teamName, setTeamName] = useState<string>("")

  useEffect(() => {
    async function loadPlayerDetails() {
      if (!playerId) return

      setLoading(true)
      setError(null)

      try {
        const playerData = await getUserById(playerId)
        setPlayer(playerData)

        // Get team name if it exists
        if (playerData.teamId) {
          const name = await getTeamName(playerData.teamId)
          setTeamName(name)
        }
      } catch (err) {
        console.error("Failed to load player details:", err)
        setError("Failed to load player details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (open && playerId) {
      loadPlayerDetails()
    }
  }, [open, playerId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Create a function that checks if we can view this player's scores
  const canViewScores = (teamId?: string) => {
    return canViewPlayerScores(user, teamId)
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
        ) : player ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={`/placeholder.svg?height=64&width=64&text=${player.name.substring(0, 2)}`}
                    alt={player.name}
                  />
                  <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-2xl">{player.name}</DialogTitle>
                  <DialogDescription className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{player.position || player.role}</Badge>
                    {player.teamId && <Badge>{teamName}</Badge>}
                    {player.titles && player.titles.length > 0 && <Badge variant="secondary">{player.titles[0]}</Badge>}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p>{player.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p>{player.createdAt ? formatDate(player.createdAt) : "Unknown"}</p>
                </div>
              </div>

              <Separator />

              {/* Proficiency Score */}
              {canViewScores(player.teamId) && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Proficiency Score</p>
                        <p className="text-2xl font-bold">{player.proficiencyScore}</p>
                      </div>
                      <Progress value={player.proficiencyScore} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Proficiencies */}
              {player.proficiencies && player.proficiencies.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Proficiencies</h3>
                  <PlayerProficiencyChartSmall 
                    proficiencies={player.proficiencies}
                    overallScore={player.proficiencyScore}
                  />
                </div>
              )}

              {/* Titles */}
              {player.titles && player.titles.length > 0 && (
                <div>
                  <h3 className="font-medium mb-1">Titles & Achievements</h3>
                  <div className="flex flex-wrap gap-2">
                    {player.titles.map((title: string) => (
                      <Badge key={title} variant="secondary">
                        {title}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">No player details available</div>
        )}
      </DialogContent>
    </Dialog>
  )
}

