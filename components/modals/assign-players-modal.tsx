"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { assignPlayersToGame, getGamePlayers } from "@/app/actions/games"

interface Player {
  id: string
  name: string | null
  image: string | null
}

interface TeamData {
  teamId: string
  teamName: string
  players: Player[]
}

interface AssignPlayersModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gameId: string
  teamId: string
  maxPlayers?: number
}

export function AssignPlayersModal({
  open,
  onOpenChange,
  gameId,
  teamId,
  maxPlayers,
}: AssignPlayersModalProps) {
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([])
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()
  const { data: session } = useSession()

  // Load team members and currently assigned players
  useEffect(() => {
    async function loadData() {
      if (open && gameId && teamId) {
        setLoading(true)
        try {
          // Get all team members
          const teamResponse = await fetch(`/api/teams/${teamId}/members`)
          if (!teamResponse.ok) throw new Error("Failed to fetch team members")
          const teamData = await teamResponse.json()
          setTeamPlayers(teamData)

          // Get currently assigned players for this game
          const gamePlayersResponse = await getGamePlayers(gameId)
          const currentTeamData = gamePlayersResponse.teams.find((t: TeamData) => t.teamId === teamId)
          
          if (currentTeamData && currentTeamData.players.length > 0) {
            // Extract player IDs
            const currentPlayerIds = currentTeamData.players.map((p: Player) => p.id)
            setSelectedPlayers(currentPlayerIds)
          } else {
            setSelectedPlayers([])
          }
        } catch (error) {
          console.error("Error loading data:", error)
          toast({
            title: "Error",
            description: "Failed to load team members or game data",
            variant: "destructive"
          })
        } finally {
          setLoading(false)
        }
      }
    }

    loadData()
  }, [open, gameId, teamId, toast])

  // Handle player selection
  const togglePlayer = (playerId: string) => {
    setSelectedPlayers(prev => {
      const isSelected = prev.includes(playerId)
      if (isSelected) {
        return prev.filter(id => id !== playerId)
      } else {
        // Check if adding this player would exceed max players
        if (maxPlayers && prev.length >= maxPlayers) {
          toast({
            title: "Error",
            description: `You can only select up to ${maxPlayers} players for this game`,
            variant: "destructive"
          })
          return prev
        }
        return [...prev, playerId]
      }
    })
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session?.user) {
      toast({
        title: "Error",
        description: "You must be logged in to assign players",
        variant: "destructive"
      })
      return
    }
    
    try {
      setSubmitting(true)
      await assignPlayersToGame(gameId, selectedPlayers)
      
      toast({
        title: "Success",
        description: `${selectedPlayers.length} players have been assigned to the game`,
      })
      
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to assign players",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Assign Players to Game</DialogTitle>
            <DialogDescription>
              Select the players from your team who will participate in this game
              {maxPlayers && ` (max ${maxPlayers} players)`}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {loading ? (
              <div className="text-center py-4">Loading players...</div>
            ) : teamPlayers.length === 0 ? (
              <div className="text-center py-4">No players found in this team</div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {teamPlayers.map(player => (
                  <div 
                    key={player.id} 
                    className="flex items-center space-x-3 border rounded-md p-2 hover:bg-muted cursor-pointer"
                    onClick={() => togglePlayer(player.id)}
                  >
                    <Checkbox 
                      checked={selectedPlayers.includes(player.id)}
                      onCheckedChange={() => togglePlayer(player.id)}
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={player.image || undefined} alt={player.name || ""} />
                      <AvatarFallback>
                        {player.name ? player.name.substring(0, 2).toUpperCase() : "?"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{player.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <div className="flex justify-between w-full">
              <div className="text-sm">
                Selected: {selectedPlayers.length} {maxPlayers && `/ ${maxPlayers}`}
              </div>
              <Button 
                type="submit" 
                disabled={loading || submitting || selectedPlayers.length === 0}
              >
                {submitting ? "Assigning..." : "Assign Players"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 