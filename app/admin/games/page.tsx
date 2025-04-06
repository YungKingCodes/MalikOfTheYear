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
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, Calendar, Check, ChevronRight, Clock, Edit, Gamepad, Plus, Trophy, Info } from "lucide-react"
import { getCompetitions } from "@/app/actions/competitions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { GameForm } from "@/components/games/game-form"
import { GameFormValues, createSuggestedGame, assignGameToCompetition } from "@/app/actions/games"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"

export default function GamesAdminPage() {
  const { toast } = useToast()
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [competitions, setCompetitions] = useState<any[]>([])
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>("")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [suggestDialogOpen, setSuggestDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [selectedGames, setSelectedGames] = useState<string[]>([])
  const [assignCompetitionId, setAssignCompetitionId] = useState<string>("")
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  
  // Form state
  const [newGame, setNewGame] = useState({
    name: "",
    description: "",
    type: "physical",
    category: "sports",
    playerCount: 0,
    duration: 30,
    pointsValue: 10,
    location: "",
  })

  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        
        // Get all competitions
        const comps = await getCompetitions()
        const active = comps?.find(comp => comp.status === "active") 
        
        setCompetitions(comps || [])
        
        if (active) {
          setSelectedCompetitionId(active.id)
        }
        
        // Fetch all games without a competition filter with cache-breaking timestamp
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/games?t=${timestamp}`, {
          credentials: "include",
          cache: 'no-store'
        })
        const data = await response.json()
        setGames(data)
      } catch (error) {
        console.error("Failed to load games data:", error)
        toast({
          title: "Error loading data",
          description: "Could not load games data. Try refreshing the page.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewGame(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setNewGame(prev => ({ ...prev, [name]: value }))
  }

  const handleCompetitionFilterChange = (value: string) => {
    setSelectedCompetitionId(value === "all" ? "" : value);
    setSelectedGames([]);
  }

  const handleGameSelection = (gameId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedGames(prev => [...prev, gameId]);
    } else {
      setSelectedGames(prev => prev.filter(id => id !== gameId));
    }
  }
  
  const handleAssignGames = async () => {
    if (!assignCompetitionId || selectedGames.length === 0) return;
    
    try {
      setIsAssigning(true);
      
      // Process games one by one
      let successCount = 0;
      let failCount = 0;
      
      for (const gameId of selectedGames) {
        try {
          const result = await assignGameToCompetition(gameId, assignCompetitionId);
          // Check that the game was updated with the competitionId
          if (result && result.competitionId === assignCompetitionId) {
            successCount++;
            
            // Update the local state
            setGames(prevGames => 
              prevGames.map(game => 
                game.id === gameId 
                  ? { ...game, competitionId: assignCompetitionId } 
                  : game
              )
            );
          } else {
            failCount++;
          }
        } catch (error) {
          console.error(`Error assigning game ${gameId}:`, error);
          failCount++;
        }
      }
      
      // Show result toast
      if (successCount > 0) {
        toast({
          title: "Games Assigned",
          description: `Successfully assigned ${successCount} game${successCount !== 1 ? 's' : ''} to the competition.`,
        });
      }
      
      if (failCount > 0) {
        toast({
          title: "Some Assignments Failed",
          description: `Failed to assign ${failCount} game${failCount !== 1 ? 's' : ''}.`,
          variant: "destructive",
        });
      }
      
      // Clear selections and close dialog
      setSelectedGames([]);
      setAssignDialogOpen(false);
      setAssignCompetitionId("");
      
    } catch (error) {
      console.error("Error assigning games:", error);
      toast({
        title: "Error",
        description: "Failed to assign games to competition",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCreateGame = async (gameData: GameFormValues) => {
    try {
      setIsCreating(true);
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameData),
      });

      if (!response.ok) {
        // Try to get a detailed error message
        let errorMessage = 'Failed to create game';
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // If we can't parse the error, use the default message
        }
        throw new Error(errorMessage);
      }

      toast({
        title: "Success",
        description: "Game added to the pool successfully",
      });
      
      setCreateDialogOpen(false);
      
      // Refresh games list
      const gamesResponse = await fetch('/api/games');
      if (gamesResponse.ok) {
        const updatedGames = await gamesResponse.json();
        setGames(updatedGames);
      }
      
    } catch (error) {
      console.error("Error creating game:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create game",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSuggestGame = async (gameData: GameFormValues) => {
    try {
      await createSuggestedGame({
        name: gameData.name,
        description: gameData.description,
        type: gameData.type,
        category: gameData.category,
        playerCount: gameData.playerCount,
        duration: gameData.duration,
        backupPlan: gameData.backupPlan,
        difficulty: gameData.difficulty || "Medium",
        winCondition: gameData.winCondition || "Score",
        materialsNeeded: gameData.materialsNeeded,
        cost: gameData.cost
      });
      
      toast({
        title: "Success",
        description: "Your game suggestion has been submitted for review",
      });
      
      setSuggestDialogOpen(false);
    } catch (error) {
      console.error("Error suggesting game:", error);
      toast({
        title: "Error",
        description: "Failed to submit game suggestion",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Games</h1>
          <div className="h-10 w-32 bg-muted animate-pulse rounded-md"></div>
        </div>
        <Separator />
        <div className="h-64 bg-muted animate-pulse rounded-md"></div>
      </div>
    )
  }

  // Only show "No Active Competition" when there are NO competitions available
  if (competitions.length === 0) {
    return (
      <div className="px-6 py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Active Competition</AlertTitle>
          <AlertDescription>
            There is no active competition to manage. Please create a competition first.
          </AlertDescription>
        </Alert>
        <div className="mt-6 flex justify-center">
          <Button asChild>
            <Link href="/admin/competitions/new">Create New Competition</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Group games by status
  const scheduledGames = games.filter(game => game.status === "scheduled")
  const completedGames = games.filter(game => game.status === "completed")

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Games Administration</h1>
          <p className="text-gray-500">Manage all games in the game pool and competitions</p>
        </div>
        
        <div className="flex space-x-2">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Game to Pool
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Game to Pool</DialogTitle>
                <DialogDescription>
                  Add a new game to the games pool. Games in the pool can be assigned to competitions later in the event management page.
                </DialogDescription>
              </DialogHeader>
              
              <GameForm
                game={{
                  name: "",
                  description: "",
                  type: "Team Sport",
                  playerCount: 0,
                  duration: 30,
                  category: "Physical",
                  status: "available",
                  pointsValue: 0,
                  difficulty: "Medium",
                  winCondition: "Score",
                  materialsNeeded: "",
                  cost: 0
                }}
                onSubmit={handleCreateGame}
                onCancel={() => setCreateDialogOpen(false)}
                isAdmin={true}
              />
            </DialogContent>
          </Dialog>
          
          <Dialog open={suggestDialogOpen} onOpenChange={setSuggestDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Suggest Game
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Suggest a Game</DialogTitle>
                <DialogDescription>
                  Suggest a game for the {selectedCompetitionId ? competitions.find(c => c.id === selectedCompetitionId)?.name || "current" : "current"} competition.
                </DialogDescription>
              </DialogHeader>
              
              <GameForm
                game={{
                  name: "",
                  description: "",
                  type: "Team Sport",
                  playerCount: 0,
                  duration: 30,
                  category: "Physical",
                  status: "available",
                  pointsValue: 0,
                  difficulty: "Medium",
                  winCondition: "Score",
                  materialsNeeded: "",
                  cost: 0
                }}
                onSubmit={handleSuggestGame}
                onCancel={() => setSuggestDialogOpen(false)}
                isAdmin={false}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Competition Filter */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Label htmlFor="competition-filter" className="whitespace-nowrap">Filter by Competition:</Label>
          <Select value={selectedCompetitionId || "all"} onValueChange={handleCompetitionFilterChange}>
            <SelectTrigger className="w-[250px]" id="competition-filter">
              <SelectValue placeholder="All Games" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Games</SelectItem>
              {competitions.map(comp => (
                <SelectItem key={comp.id} value={comp.id}>
                  {comp.name} ({comp.year})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedGames.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm">{selectedGames.length} games selected</span>
            <Button 
              size="sm" 
              onClick={() => setAssignDialogOpen(true)}
              disabled={isAssigning}
            >
              Assign to Competition
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setSelectedGames([])}
            >
              Clear Selection
            </Button>
          </div>
        )}
      </div>
      
      {loading ? (
        <Card>
          <CardContent className="py-10">
            <div className="flex justify-center">
              <p>Loading games...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Games</TabsTrigger>
              <TabsTrigger value="unassigned">Unassigned Games</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              <GamesList 
                games={selectedCompetitionId 
                  ? games.filter(g => g.competitionId === selectedCompetitionId)
                  : games
                } 
                competitions={competitions}
                selectedCompetitionId={selectedCompetitionId || "all"}
                selectedGames={selectedGames}
                onSelectGame={handleGameSelection}
              />
            </TabsContent>
            
            <TabsContent value="unassigned" className="mt-6">
              <GamesList 
                games={games.filter(game => !game.competitionId)} 
                competitions={competitions}
                selectedCompetitionId={selectedCompetitionId || "all"}
                selectedGames={selectedGames}
                onSelectGame={handleGameSelection}
              />
            </TabsContent>
            
            <TabsContent value="scheduled" className="mt-6">
              <GamesList 
                games={selectedCompetitionId 
                  ? games.filter(g => g.competitionId === selectedCompetitionId && g.status === "scheduled")
                  : games.filter(g => g.status === "scheduled")
                } 
                competitions={competitions}
                selectedCompetitionId={selectedCompetitionId || "all"}
                selectedGames={selectedGames}
                onSelectGame={handleGameSelection}
              />
            </TabsContent>
            
            <TabsContent value="completed" className="mt-6">
              <GamesList 
                games={selectedCompetitionId 
                  ? games.filter(g => g.competitionId === selectedCompetitionId && g.status === "completed")
                  : games.filter(g => g.status === "completed")
                } 
                competitions={competitions}
                selectedCompetitionId={selectedCompetitionId || "all"}
                selectedGames={selectedGames}
                onSelectGame={handleGameSelection}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
      
      {/* Assign to Competition Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Games to Competition</DialogTitle>
            <DialogDescription>
              Select a competition to assign the selected games to.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="assign-competition">Competition</Label>
              <Select 
                value={assignCompetitionId} 
                onValueChange={setAssignCompetitionId}
              >
                <SelectTrigger id="assign-competition">
                  <SelectValue placeholder="Select a competition" />
                </SelectTrigger>
                <SelectContent>
                  {competitions.map(comp => (
                    <SelectItem key={comp.id} value={comp.id}>
                      {comp.name} ({comp.year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-blue-500" />
              <p className="text-sm text-muted-foreground">
                Assigning games to a competition will make them available for scheduling.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setAssignDialogOpen(false)}
              disabled={isAssigning}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssignGames}
              disabled={!assignCompetitionId || isAssigning}
            >
              {isAssigning ? "Assigning..." : "Assign Games"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function GamesList({ 
  games, 
  competitions,
  selectedCompetitionId,
  selectedGames,
  onSelectGame
}: { 
  games: any[]
  competitions: any[]
  selectedCompetitionId: string
  selectedGames: string[]
  onSelectGame: (gameId: string, isSelected: boolean) => void
}) {
  if (games.length === 0) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <Gamepad className="h-8 w-8 text-gray-400" />
            <div>
              <p className="text-lg font-medium">No games found</p>
              <p className="text-sm text-gray-500">
                {selectedCompetitionId && selectedCompetitionId !== "all" 
                  ? "No games found for this competition. Add games from the pool or create new games."
                  : "Get started by creating a new game for the pool."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  // Get competition names for display
  const getCompetitionName = (competitionId: string | null) => {
    if (!competitionId) return "Not Assigned";
    const comp = competitions.find(c => c.id === competitionId);
    return comp ? `${comp.name} (${comp.year})` : "Unknown";
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {selectedCompetitionId && selectedCompetitionId !== "all"
            ? `Games in ${getCompetitionName(selectedCompetitionId)}`
            : "All Games"}
        </CardTitle>
        <CardDescription>
          Showing {games.length} game{games.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30px]">
                <Checkbox 
                  checked={games.length > 0 && games.every(g => selectedGames.includes(g.id))} 
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onSelectGame(games.map(g => g.id).filter(id => !selectedGames.includes(id))[0], true);
                    } else {
                      games.forEach(g => {
                        if (selectedGames.includes(g.id)) {
                          onSelectGame(g.id, false);
                        }
                      });
                    }
                  }}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Competition</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {games.map((game) => (
              <TableRow key={game.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedGames.includes(game.id)}
                    onCheckedChange={(checked) => onSelectGame(game.id, !!checked)}
                  />
                </TableCell>
                <TableCell className="font-medium">{game.name}</TableCell>
                <TableCell>
                  {game.competitionId ? (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                      {getCompetitionName(game.competitionId)}
                    </Badge>
                  ) : (
                    <Badge variant="outline">Game Pool</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {game.date ? new Date(game.date).toLocaleDateString() : 'TBD'}
                </TableCell>
                <TableCell>
                  <Badge variant={game.status === "completed" ? "success" : "default"}>
                    {game.status === "completed" ? (
                      <Check className="mr-1 h-3 w-3" />
                    ) : (
                      <Calendar className="mr-1 h-3 w-3" />
                    )}
                    {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{game.pointsValue || 0}</TableCell>
                <TableCell>{game.type || 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Link href={`/admin/games/${game.id}`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/games/${game.id}`}>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
} 