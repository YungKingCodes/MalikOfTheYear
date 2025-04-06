"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUserById } from "@/lib/data"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { useSession } from "next-auth/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Trophy, Medal } from "lucide-react"
import { PlayerProficiencyChartSmall } from "@/components/player-profile/proficiency-chart-small"
import { PlayerData, ProficiencyData } from "@/types/player"

interface PlayerDetailsModalProps {
  playerId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PlayerDetailsModal({ playerId, open, onOpenChange }: PlayerDetailsModalProps) {
  const { data: session } = useSession()
  const user = session?.user
  const [player, setPlayer] = useState<PlayerData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPlayerDetails() {
      if (!playerId) return

      setLoading(true)
      setError(null)

      try {
        const playerData = await getUserById(playerId)
        
        // Ensure proficiencies match the expected format
        if (playerData.proficiencies) {
          playerData.proficiencies = playerData.proficiencies.map((p: any) => ({
            name: p.name,
            // Use the value as score if it exists, otherwise use the existing score or 0
            score: p.score || p.value || 0,
            value: p.value
          }));
        }
        
        setPlayer(playerData)
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
  const canViewScores = () => {
    return user?.role === "admin" // Only admins can view proficiency scores
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
                    src={player.image || `/placeholder.svg?height=64&width=64&text=${player.name.substring(0, 2)}`}
                    alt={player.name}
                  />
                  <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-2xl">{player.name}</DialogTitle>
                  <DialogDescription className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{player.position || player.role}</Badge>
                    {player.teamId && <Badge>{player.teamName}</Badge>}
                    {player.titles && player.titles.length > 0 && <Badge variant="secondary">{player.titles[0]}</Badge>}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <Tabs defaultValue="details" className="mt-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="competitions">Competitions</TabsTrigger>
                <TabsTrigger value="accolades">Accolades</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4 mt-4">
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

                {/* Win/Loss Ratio */}
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-medium mb-3">Performance Stats</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Wins</p>
                        <p className="text-2xl font-bold">{player.wins || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Losses</p>
                        <p className="text-2xl font-bold">{player.losses || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Win Ratio</p>
                        <p className="text-2xl font-bold">
                          {player.wins && (player.wins + player.losses) > 0
                            ? `${Math.round((player.wins / (player.wins + player.losses)) * 100)}%`
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Proficiency Score - Only visible to admins */}
                {canViewScores() && (
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

                {/* Proficiencies - Only visible to admins */}
                {canViewScores() && player.proficiencies && player.proficiencies.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Proficiencies</h3>
                    <PlayerProficiencyChartSmall 
                      proficiencies={player.proficiencies}
                      overallScore={player.proficiencyScore}
                    />
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="competitions" className="space-y-4 mt-4">
                <h3 className="font-medium">Registered Competitions</h3>
                {player.competitions && player.competitions.length > 0 ? (
                  <div className="space-y-3">
                    {player.competitions.map((competition, index) => (
                      <Card key={competition.id || index}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{competition.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {competition.startDate && formatDate(competition.startDate)}
                                {competition.endDate && ` - ${formatDate(competition.endDate)}`}
                              </p>
                            </div>
                            <Badge className="ml-auto">{competition.status || "Upcoming"}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No competitions registered
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="accolades" className="space-y-4 mt-4">
                <h3 className="font-medium">Achievements & Accolades</h3>
                {player.titles && player.titles.length > 0 ? (
                  <div className="space-y-3">
                    {player.titles.map((title, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Trophy className="h-5 w-5 text-amber-500" />
                            <div>
                              <p className="font-medium">{title}</p>
                              <p className="text-sm text-muted-foreground">
                                Earned {title.includes("'24") ? "2024" : "2023"}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No accolades earned yet
                  </div>
                )}
                
                {player.awards && player.awards.length > 0 && (
                  <>
                    <h3 className="font-medium mt-4">Awards</h3>
                    <div className="space-y-3">
                      {player.awards.map((award, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <Medal className="h-5 w-5 text-blue-500" />
                              <div>
                                <p className="font-medium">{award.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {award.date && formatDate(award.date)}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">No player details available</div>
        )}
      </DialogContent>
    </Dialog>
  )
}

