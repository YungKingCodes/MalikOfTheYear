"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Users } from "lucide-react"

interface Player {
  id: string
  name: string
  position: string
  proficiencyScore: number
  avatar: string
  selected: boolean
}

interface GameAssignmentProps {
  gameId: string
  gameName: string
  gameDate: string
  gameType: string
  requiresAllPlayers: boolean
  maxPlayers?: number
}

export function GamePlayerAssignment({
  gameId,
  gameName,
  gameDate,
  gameType,
  requiresAllPlayers,
  maxPlayers = 8,
}: GameAssignmentProps) {
  // Mock team players data
  const [players, setPlayers] = useState<Player[]>([
    { id: "p1", name: "Sarah Johnson", position: "Captain", proficiencyScore: 98, avatar: "SJ", selected: false },
    { id: "p2", name: "Emily Rodriguez", position: "Forward", proficiencyScore: 94, avatar: "ER", selected: false },
    { id: "p3", name: "David Kim", position: "Defense", proficiencyScore: 92, avatar: "DK", selected: false },
    { id: "p4", name: "Michael Chen", position: "Utility", proficiencyScore: 90, avatar: "MC", selected: false },
    { id: "p5", name: "James Wilson", position: "Forward", proficiencyScore: 89, avatar: "JW", selected: false },
    { id: "p6", name: "Lisa Thompson", position: "Defense", proficiencyScore: 87, avatar: "LT", selected: false },
    { id: "p7", name: "Robert Garcia", position: "Utility", proficiencyScore: 85, avatar: "RG", selected: false },
    { id: "p8", name: "Jennifer Lee", position: "Specialist", proficiencyScore: 83, avatar: "JL", selected: false },
  ])

  const { data: session } = useSession()
  const user = session?.user
  const { toast } = useToast()
  const isCaptain = user?.role === "captain"

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

  const handleSubmit = () => {
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

    // In a real implementation, this would call an API endpoint
    toast({
      title: "Players Assigned",
      description: `Successfully assigned ${selectedCount} players to ${gameName}.`,
    })

    // For demo purposes, we'll just log the selected players
    console.log(
      "Assigned players:",
      players.filter((p) => p.selected).map((p) => p.name),
    )
  }

  if (!isCaptain) {
    return null
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
                        src={`/placeholder.svg?height=32&width=32&text=${player.avatar}`}
                        alt={player.name}
                      />
                      <AvatarFallback>{player.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{player.name}</p>
                      <p className="text-xs text-muted-foreground">{player.position}</p>
                    </div>
                  </div>
                  <div className="text-sm">{player.position}</div>
                  <div className="text-sm">{player.proficiencyScore}</div>
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
      <CardFooter className="flex justify-end gap-2 border-t bg-muted/20 p-4">
        <Button variant="outline">Cancel</Button>
        <Button
          className="bg-primary hover:bg-primary/90"
          onClick={handleSubmit}
          disabled={!isValid && !requiresAllPlayers}
        >
          Assign Players
        </Button>
      </CardFooter>
    </Card>
  )
}

