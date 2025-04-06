"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { GameForm } from "@/components/games/game-form"
import { GameFormValues, getGameById, updateGame } from "@/app/actions/games"
import { getCompetitions } from "@/app/actions/competitions"

export default function EditGameClient({ id }: { id: string }) {
  const router = useRouter()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [game, setGame] = useState<any>(null)
  const [competitions, setCompetitions] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [gameData, compsData] = await Promise.all([
          getGameById(id),
          getCompetitions()
        ])
        
        if (!gameData) {
          toast({
            title: "Game not found",
            description: "The requested game could not be found.",
            variant: "destructive"
          })
          router.push("/admin/games")
          return
        }
        
        setGame(gameData)
        setCompetitions(compsData || [])
      } catch (error) {
        console.error("Failed to load game:", error)
        toast({
          title: "Error loading data",
          description: "Could not load game data. Please try again.",
          variant: "destructive"
        })
        router.push("/admin/games")
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [id, router, toast])

  const handleSubmit = async (formData: GameFormValues) => {
    try {
      await updateGame(id, formData)
      
      toast({
        title: "Game updated",
        description: `Game "${formData.name}" has been updated successfully.`
      })
      
      // Force a hard navigation to refresh data
      window.location.href = "/admin/games";
      return true;
    } catch (error) {
      console.error("Failed to update game:", error)
      toast({
        title: "Error updating game",
        description: error instanceof Error ? error.message : "Could not update the game. Please try again.",
        variant: "destructive"
      })
      return false
    }
  }

  const handleCancel = () => {
    router.push("/admin/games")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading game data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-3xl">
      <div className="flex flex-col space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Edit Game</h1>
        <p className="text-muted-foreground">
          Update the details for this game
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Game Details</CardTitle>
          <CardDescription>
            Update the information for this game
          </CardDescription>
        </CardHeader>
        <CardContent>
          {game && (
            <GameForm
              game={{
                id: game.id,
                name: game.name,
                description: game.description,
                type: game.type,
                playerCount: game.playerCount,
                duration: game.duration,
                category: game.category,
                status: game.status,
                date: game.date,
                location: game.location,
                pointsValue: game.pointsValue,
                backupPlan: game.backupPlan,
                competitionId: game.competitionId,
                difficulty: game.difficulty,
                winCondition: game.winCondition,
                materialsNeeded: game.materialsNeeded,
                cost: game.cost
              }}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isAdmin={true}
              competitions={competitions}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
} 