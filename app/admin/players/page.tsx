"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { 
  Calculator, 
  Edit, 
  Plus, 
  RefreshCw,
  Search,
  UserCog
} from "lucide-react"
import { getCompetitions } from "@/app/actions/competitions"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"

export default function PlayersAdminPage() {
  const { toast } = useToast()
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [competitions, setCompetitions] = useState<any[]>([])
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [currentPlayer, setCurrentPlayer] = useState<any>(null)
  const [editedProficiencyScore, setEditedProficiencyScore] = useState<number>(0)
  const [isGeneratingScores, setIsGeneratingScores] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        
        // Get competitions
        const competitionsData = await getCompetitions()
        
        if (!competitionsData || competitionsData.length === 0) {
          setLoading(false)
          return
        }
        
        setCompetitions(competitionsData)
        
        // Set active competition as default
        const active = competitionsData.find(comp => comp.status === "active") || competitionsData[0]
        setSelectedCompetitionId(active.id)
        
        // Fetch players for the active competition
        await loadPlayersForCompetition(active.id)
      } catch (error) {
        console.error("Failed to load players data:", error)
        toast({
          title: "Error loading data",
          description: "Could not load players data. Try refreshing the page.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  const loadPlayersForCompetition = async (competitionId: string) => {
    if (!competitionId) return
    
    try {
      setLoading(true)
      console.log(`Fetching players for competition: ${competitionId}`)
      
      // Fetch players from the API endpoint
      const response = await fetch(`/api/players?competitionId=${competitionId}`, {
        credentials: "include"
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error("API response error:", response.status, errorText)
        throw new Error(`Failed to fetch players: ${response.status} ${errorText}`);
      }
      
      const data = await response.json()
      console.log("Players data received:", data)
      setPlayers(data)
    } catch (error) {
      console.error("Failed to load players:", error)
      toast({
        title: "Error loading players",
        description: "Could not load players for this competition.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCompetitionChange = (competitionId: string) => {
    setSelectedCompetitionId(competitionId)
    loadPlayersForCompetition(competitionId)
  }

  const handleGenerateScores = async () => {
    if (!selectedCompetitionId) {
      toast({
        title: "No competition selected",
        description: "Please select a competition first.",
        variant: "destructive"
      })
      return
    }

    setIsGeneratingScores(true)
    try {
      const response = await fetch('/api/players/generate-scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          competitionId: selectedCompetitionId
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate player scores")
      }

      const result = await response.json()
      
      // Refresh the players list
      await loadPlayersForCompetition(selectedCompetitionId)
      
      toast({
        title: "Scores generated",
        description: `Generated scores for ${result.updatedPlayers} players.`
      })
    } catch (error) {
      console.error("Failed to generate scores:", error)
      toast({
        title: "Error generating scores",
        description: error instanceof Error ? error.message : "Could not generate player scores. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGeneratingScores(false)
    }
  }

  const handleEditClick = (player: any) => {
    setCurrentPlayer(player)
    setEditedProficiencyScore(player.proficiencyScore || 50)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!currentPlayer) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/players/${currentPlayer.user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          competitionId: selectedCompetitionId,
          proficiencyScore: editedProficiencyScore
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update player score")
      }

      // Refresh the players list
      await loadPlayersForCompetition(selectedCompetitionId)
      
      setEditDialogOpen(false)
      
      toast({
        title: "Player updated",
        description: `Updated ${currentPlayer.user.name}'s proficiency score.`
      })
    } catch (error) {
      console.error("Failed to update player:", error)
      toast({
        title: "Error updating player",
        description: error instanceof Error ? error.message : "Could not update player. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Filter players by search query
  const filteredPlayers = searchQuery
    ? players.filter(player => 
        player.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : players

  if (loading && !competitions.length) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Players</h1>
          <div className="h-10 w-32 bg-muted animate-pulse rounded-md"></div>
        </div>
        <Separator />
        <div className="h-64 bg-muted animate-pulse rounded-md"></div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Players</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage players and their proficiency scores
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select
            value={selectedCompetitionId}
            onValueChange={handleCompetitionChange}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select Competition" />
            </SelectTrigger>
            <SelectContent>
              {competitions.map((competition) => (
                <SelectItem key={competition.id} value={competition.id}>
                  {competition.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={handleGenerateScores}
            disabled={isGeneratingScores}
          >
            {isGeneratingScores ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Calculator className="h-4 w-4 mr-2" />
                Generate Scores
              </>
            )}
          </Button>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Registration Status</TableHead>
              <TableHead className="w-[200px]">Proficiency Score</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers.length > 0 ? (
              filteredPlayers.map((player) => (
                <TableRow key={player.id}>
                  <TableCell className="font-medium">{player.user.name}</TableCell>
                  <TableCell>{player.user.email}</TableCell>
                  <TableCell>
                    <Badge variant={player.status === "registered" ? "default" : "secondary"}>
                      {player.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{player.proficiencyScore || 'N/A'}</span>
                      <Progress 
                        value={player.proficiencyScore || 0} 
                        max={100} 
                        className="h-2 flex-1" 
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEditClick(player)}
                    >
                      <UserCog className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {loading 
                    ? "Loading players..." 
                    : searchQuery 
                      ? "No players match your search." 
                      : "No players found for this competition."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Player Proficiency</DialogTitle>
            <DialogDescription>
              Update proficiency score for {currentPlayer?.user.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="proficiency-score">Proficiency Score (0-100)</Label>
              <Input
                id="proficiency-score"
                type="number"
                min="0"
                max="100"
                value={editedProficiencyScore}
                onChange={(e) => setEditedProficiencyScore(Number(e.target.value))}
              />
              <Progress 
                value={editedProficiencyScore} 
                max={100} 
                className="h-2 mt-2" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 