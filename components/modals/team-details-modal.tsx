"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getTeamById } from "@/lib/data"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Trophy, Users, Crown } from "lucide-react"

interface TeamDetailsModalProps {
  teamId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TeamDetailsModal({ teamId, open, onOpenChange }: TeamDetailsModalProps) {
  const [team, setTeam] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTeamDetails() {
      if (!teamId) return

      setLoading(true)
      setError(null)

      try {
        const teamData = await getTeamById(teamId)
        setTeam(teamData)
      } catch (err) {
        console.error("Failed to load team details:", err)
        setError("Failed to load team details. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (open && teamId) {
      loadTeamDetails()
    }
  }, [open, teamId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
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
        ) : team ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={`/placeholder.svg?height=64&width=64&text=${team.name.substring(0, 2)}`}
                    alt={team.name}
                  />
                  <AvatarFallback>{team.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-2xl">{team.name}</DialogTitle>
                  <DialogDescription className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{team.members ? `${team.members.length}/8 Members` : "Team"}</Badge>
                    <Badge>Rank #{team.rank || "?"}</Badge>
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Team Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Trophy className="h-5 w-5 mx-auto mb-1 text-amber-500" />
                    <p className="text-sm text-muted-foreground">Score</p>
                    <p className="text-xl font-bold">{team.score}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <p className="text-sm text-muted-foreground">Win Rate</p>
                    <p className="text-xl font-bold">{team.winRate || 0}%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Crown className="h-5 w-5 mx-auto mb-1 text-amber-500" />
                    <p className="text-sm text-muted-foreground">Captain</p>
                    <p className="text-sm font-medium truncate">
                      {team.members?.find((m: any) => m._id === team.captain)?.name || "None"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Team Progress</p>
                  <p className="text-sm font-medium">
                    {team.score}/{team.maxScore}
                  </p>
                </div>
                <Progress value={(team.score / team.maxScore) * 100} className="h-2" />
              </div>

              <Separator />

              {/* Team Members */}
              {team.members && team.members.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Team Members</h3>
                  <div className="space-y-2">
                    {team.members.map((member: any) => (
                      <div key={member._id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={`/placeholder.svg?height=32&width=32&text=${member.name.substring(0, 2)}`}
                              alt={member.name}
                            />
                            <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.position}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {member._id === team.captain && <Badge variant="secondary">Captain</Badge>}
                          {member.titles && member.titles.length > 0 && (
                            <Badge variant="outline">{member.titles[0]}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Created Date */}
              <div className="text-sm text-muted-foreground text-right">
                Team created: {team.createdAt ? formatDate(team.createdAt) : "Unknown"}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">No team details available</div>
        )}
      </DialogContent>
    </Dialog>
  )
}

