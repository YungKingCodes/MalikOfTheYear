"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CalendarIcon, Clock, MoreVertical, UsersIcon, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

interface Game {
  id: string
  name: string
  description: string
  type: string
  playerCount: number
  duration: number
  category: string
  status: string
  date?: string
  location?: string
  pointsValue?: number
  backupPlan?: string
  team1?: { id: string; name: string }
  team2?: { id: string; name: string }
}

interface GameCardProps {
  game: Game
  onView: () => void
  onStatusChange?: (status: string) => void
  onDelete?: () => void
}

export function GameCard({ game, onView, onStatusChange, onDelete }: GameCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg truncate">{game.name}</CardTitle>
          
          {onStatusChange || onDelete ? (
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onStatusChange && game.status !== "available" && (
                  <DropdownMenuItem onClick={() => onStatusChange("available")}>
                    Mark as Available
                  </DropdownMenuItem>
                )}
                {onStatusChange && game.status !== "scheduled" && (
                  <DropdownMenuItem onClick={() => onStatusChange("scheduled")}>
                    Mark as Scheduled
                  </DropdownMenuItem>
                )}
                {onStatusChange && game.status !== "completed" && (
                  <DropdownMenuItem onClick={() => onStatusChange("completed")}>
                    Mark as Completed
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={onDelete}
                  >
                    Delete Game
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
        <div className="flex items-center mt-1 gap-2">
          {getStatusBadge(game.status)}
          <span className="text-xs text-muted-foreground">{game.type}</span>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{game.description}</p>
        
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div className="flex items-center gap-1">
            <UsersIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{game.playerCount || "N/A"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{game.duration} min</span>
          </div>
          
          {game.date && (
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{formatDate(game.date)}</span>
            </div>
          )}
          
          {game.pointsValue && (
            <div className="flex items-center gap-1">
              <Trophy className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{game.pointsValue} points</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-center"
          onClick={onView}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
} 