"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Users } from "lucide-react"
import { getGamePlayers, assignPlayersToGame } from "@/app/actions/games"

interface Player {
  id: string
  name: string | null
  position?: string | null
  proficiencyScore?: number | null
  image?: string | null
  selected: boolean
}

interface GameAssignmentProps {
  gameId: string
  gameName: string
  gameDate: string
  gameType: string
  requiresAllPlayers: boolean
  maxPlayers?: number
  teamId?: string
}

export function GamePlayerAssignment({
  gameId,
  gameName,
  gameDate,
  gameType,
  requiresAllPlayers,
  maxPlayers = 8,
  teamId,
}: GameAssignmentProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const { data: session } = useSession()
  const user = session?.user
  const { toast } = useToast()
  const isCaptain = user?.role === "captain"
  const userTeamId = user?.teamId || teamId
  
  // Fetch team members and currently assigned players
  useEffect(() => {
    async function loadData() {
      if (!userTeamId) {
        setLoading(false)
        return
      }
      
      try {
        setLoading(true)
        
        // Get team members
        const teamResponse = await fetch(`/api/teams/${userTeamId}/members`)
        if (!teamResponse.ok) {
          throw new Error("Failed to fetch team members")
        }
        const teamMembers = await teamResponse.json()
        
        // Get currently assigned players for this game
        let selectedPlayerIds: string[] = []
        try {
          const gamePlayersResponse = await getGamePlayers(gameId)
          const currentTeamData = gamePlayersResponse.teams.find((t: any) => t.teamId === userTeamId)
          
          if (currentTeamData && currentTeamData.players.length > 0) {
            selectedPlayerIds = currentTeamData.players.map((p: any) => p.id)
          }
        } catch (error) {
          console.error("Error fetching game players:", error)
          // Continue with empty selections if this fails
        }
        
        // Map team members to players with selection status
        const mappedPlayers = teamMembers.map((member: any) => ({
          id: member.id,
          name: member.name,
          position: member.position || "Team Member",
          proficiencyScore: member.proficiencyScore || 50,
          image: member.image,
          selected: selectedPlayerIds.includes(member.id) || requiresAllPlayers
        }))
        
        setPlayers(mappedPlayers)
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Error",
          description: "Failed to load team members",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [gameId, userTeamId, requiresAllPlayers, toast])

  const selectedCount = players.filter((p) => p.selected).length
  const isValid = requiresAllPlayers
    ? selectedCount === players.length
    : selectedCount > 0 && selectedCount <= (maxPlayers || players.length)

  const togglePlayerSelection = (playerId: string) => {
    if (!isCaptain) {
      toast({
        title: "Permission Denied",
        description: "Only team captains can assign players to games.",
        variant: "destructive",
      })
      return
    }

    if (requiresAllPlayers) {
      toast({
        title: "All Players Required",
        description: "This game requires all team members to participate.",
        variant: "destructive",
      })
      return
    }

    setPlayers((prev) =>
      prev.map((player) => {
        if (player.id === playerId) {
          // If we're trying to deselect and already at max, prevent it
          if (player.selected) {
            return { ...player, selected: !player.selected }
          }

          // If we're trying to select and already at max, prevent it
          if (selectedCount >= (maxPlayers || players.length)) {
            toast({
              title: "Maximum Players Reached",
              description: `You can only select up to ${maxPlayers || players.length} players for this game.`,
              variant: "destructive",
            })
            return player
          }

          return { ...player, selected: !player.selected }
        }
        return player
      }),
    )
  }

  const handleSubmit = async () => {
    if (!isValid) {
      toast({
        title: "Invalid Selection",
        description: requiresAllPlayers
          ? "This game requires all team members to participate."
          : `Please select between 1 and ${maxPlayers} players.`,
        variant: "destructive",
      })
      return
    }
    
    if (!userTeamId) {
      toast({
        title: "Error",
        description: "No team selected",
        variant: "destructive",
      })
      return
    }
    
    try {
      setSubmitting(true)
      
      // Get selected player IDs
      const selectedPlayerIds = players
        .filter(player => player.selected)
        .map(player => player.id)
        
      // Submit player assignments
      await assignPlayersToGame(gameId, selectedPlayerIds)
      
      toast({
        title: "Players Assigned",
        description: `Successfully assigned ${selectedCount} players to ${gameName}.`,
      })
    } catch (error) {
      console.error("Error assigning players:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to assign players",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (!isCaptain) {
    return null
  }
  
  if (loading) {
    return (
      <Card className="mt-6 border-primary/20">
        <CardHeader className="bg-primary/5">
          <CardTitle className="text-primary">Assign Players to Game</CardTitle>
          <CardDescription>Loading player data...</CardDescription>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <div className="animate-pulse text-muted-foreground">Loading team members...</div>
        </CardContent>
      </Card>
    )
  }
  
  if (players.length === 0) {
    return (
      <Card className="mt-6 border-primary/20">
        <CardHeader className="bg-primary/5">
          <CardTitle className="text-primary">Assign Players to Game</CardTitle>
          <CardDescription>No players available</CardDescription>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <div className="text-muted-foreground">No team members found</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-6 border-primary/20">
      <CardHeader className="bg-primary/5">
        <CardTitle className="text-primary">Assign Players to Game</CardTitle>
        <CardDescription>
          {requiresAllPlayers
            ? "This game requires all team members to participate."
            : `Select up to ${maxPlayers} players to participate in this game.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-medium text-lg">{gameName}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  <span>{new Date(gameDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{requiresAllPlayers ? "All players required" : `Up to ${maxPlayers} players`}</span>
                </div>
              </div>
            </div>
            <Badge className="bg-secondary">{gameType}</Badge>
          </div>

          <div className="border rounded-md">
            <div className="grid grid-cols-5 p-3 bg-muted/50 font-medium text-sm">
              <div className="col-span-2">Player</div>
              <div>Position</div>
              <div>Score</div>
              <div className="text-right">Select</div>
            </div>
            <div className="divide-y">
              {players.map((player) => (
                <div key={player.id} className="grid grid-cols-5 p-3 items-center">
                  <div className="col-span-2 flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={player.image || `/placeholder.svg?height=32&width=32&text=${player.name?.substring(0, 2) || "??"}`}
                        alt={player.name || "Unknown"}
                      />
                      <AvatarFallback>{player.name ? player.name.substring(0, 2).toUpperCase() : "??"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{player.name || "Unknown Player"}</p>
                      <p className="text-xs text-muted-foreground">{player.position || "Team Member"}</p>
                    </div>
                  </div>
                  <div className="text-sm">{player.position || "Team Member"}</div>
                  <div className="text-sm">{player.proficiencyScore || "-"}</div>
                  <div className="flex justify-end">
                    <Checkbox
                      checked={player.selected || requiresAllPlayers}
                      onCheckedChange={() => togglePlayerSelection(player.id)}
                      disabled={requiresAllPlayers}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-4">
        <Button
          onClick={handleSubmit}
          disabled={!isValid || submitting}
        >
          {submitting ? "Submitting..." : "Assign Players"}
        </Button>
      </CardFooter>
    </Card>
  )
}

