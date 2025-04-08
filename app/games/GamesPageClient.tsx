"use client"

import { useState, useTransition, useMemo } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { GameCard } from "@/components/games/game-card"
import { GameForm } from "@/components/games/game-form"
import { GameDetailsModal } from "@/components/modals/game-details-modal"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  voteForGame,
  createSuggestedGame,
  deleteGame,
  updateGameStatus,
  approveGame,
  GameFormValues
} from "@/app/actions/games"
import { cn } from "@/lib/utils"
import { Empty } from "@/components/empty"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TeamParticipant {
  id: string
  teamId: string
  team: {
    id: string
    name: string
  }
}

interface Game {
  id: string
  name: string
  description: string
  type: string
  playerCount: number
  duration: number
  category: string
  status: string
  date?: Date | string | null
  location?: string | null
  pointsValue?: number | null
  backupPlan?: string | null
  difficulty?: string
  winCondition?: string
  materialsNeeded?: string | null
  cost?: number | null
  participants: TeamParticipant[]
  competition?: { 
    id: string
    name: string
    year: number 
  } | null
}

interface UserVote {
  id: string
}

interface SuggestedGame {
  id: string
  name: string
  description: string
  type: string
  category: string
  playerCount: number
  duration: number
  backupPlan?: string
  difficulty: string
  winCondition: string
  materialsNeeded?: string
  cost?: number
  votes: number
  userVotes?: UserVote[]
  hasVoted?: boolean
  createdAt?: string | Date
  suggestedBy: { 
    id: string
    name: string 
  }
}

interface GamesPageClientProps {
  initialGames: Game[]
  initialSuggestedGames: SuggestedGame[]
  userRole: string
}

export function GamesPageClient({
  initialGames,
  initialSuggestedGames,
  userRole
}: GamesPageClientProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // State management
  const [games, setGames] = useState<Game[]>(initialGames)
  const [suggestedGames, setSuggestedGames] = useState<SuggestedGame[]>(initialSuggestedGames)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  
  // New state for suggested games filtering
  const [suggestedGamesSortOption, setSuggestedGamesSortOption] = useState<string>("votes-desc")
  const [suggestedGamesSearchQuery, setSuggestedGamesSearchQuery] = useState("")
  
  // Modals state
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false)

  // Regular games filtering logic
  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (activeTab === "all") return matchesSearch
    if (activeTab === "available") return matchesSearch && game.status === "available"
    if (activeTab === "scheduled") return matchesSearch && game.status === "scheduled"
    if (activeTab === "completed") return matchesSearch && game.status === "completed"
    return matchesSearch
  })

  // Suggested games filtering and sorting logic
  const filteredSuggestedGames = useMemo(() => {
    // First filter by search query if one exists
    const filtered = suggestedGamesSearchQuery
      ? suggestedGames.filter(game => 
          game.name.toLowerCase().includes(suggestedGamesSearchQuery.toLowerCase()) ||
          game.description.toLowerCase().includes(suggestedGamesSearchQuery.toLowerCase()) ||
          game.suggestedBy.name.toLowerCase().includes(suggestedGamesSearchQuery.toLowerCase())
        )
      : [...suggestedGames];
    
    // Then sort based on selected sort option
    switch (suggestedGamesSortOption) {
      case "votes-desc":
        return filtered.sort((a, b) => b.votes - a.votes);
      case "votes-asc":
        return filtered.sort((a, b) => a.votes - b.votes);
      case "name-asc":
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return filtered.sort((a, b) => b.name.localeCompare(a.name));
      case "newest":
        return filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      default:
        return filtered.sort((a, b) => b.votes - a.votes); // Default to votes descending
    }
  }, [suggestedGames, suggestedGamesSortOption, suggestedGamesSearchQuery]);

  // Actions
  const handleViewGame = (gameId: string) => {
    setSelectedGameId(gameId)
    setIsDetailsModalOpen(true)
  }

  const handleVote = async (gameId: string) => {
    startTransition(async () => {
      try {
        const result = await voteForGame(gameId)
        
        // Update local state
        setSuggestedGames(prev => 
          prev.map(game => 
            game.id === gameId 
              ? { ...game, votes: game.votes + 1, hasVoted: true } 
              : game
          )
        )
        
        toast({
          title: "Vote recorded",
          description: "Your vote has been recorded successfully.",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to record your vote. Please try again.",
          variant: "destructive",
        })
      }
    })
  }

  const handleApprove = async (gameId: string) => {
        startTransition(async () => {
          try {
        const result = await approveGame(gameId)
        
        // Update local state
        setSuggestedGames(prev => prev.filter(game => game.id !== gameId))
        
        // Add the new game to the games list if successful
        if (result?.game) {
          const newGame = result.game as unknown as Game
          setGames(prev => [...prev, newGame])
        }
        
        toast({
          title: "Game approved",
          description: "The suggested game has been approved and added to the games list.",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to approve the game. Please try again.",
          variant: "destructive",
        })
      }
    })
  }

  const handleDelete = async (gameId: string) => {
    if (!confirm("Are you sure you want to delete this game?")) return

    startTransition(async () => {
      try {
        await deleteGame(gameId)
        
        // Update local state
        setGames(prev => prev.filter(game => game.id !== gameId))
        
        toast({
          title: "Game deleted",
          description: "The game has been deleted successfully.",
        })
      } catch (error) {
      toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete the game. Please try again.",
        variant: "destructive",
      })
      }
    })
  }

  const handleStatusChange = async (gameId: string, status: string) => {
    startTransition(async () => {
      try {
        await updateGameStatus(gameId, status)
        
        // Update local state
        setGames(prev => 
          prev.map(game => 
            game.id === gameId 
              ? { ...game, status } 
              : game
          )
    )

    toast({
          title: "Status updated",
          description: `Game status has been updated to ${status}.`,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to update game status. Please try again.",
          variant: "destructive",
        })
      }
    })
  }

  const handleSuggestGame = async (formData: GameFormValues) => {
    startTransition(async () => {
      try {
        const newSuggestedGame = await createSuggestedGame(formData)
        
        if (newSuggestedGame) {
          // Update local state with the new suggested game
          setSuggestedGames(prev => [...prev, {
            ...newSuggestedGame,
            votes: 1, // Start with 1 vote from the creator
            hasVoted: true,
            difficulty: formData.difficulty || "Medium",
            winCondition: formData.winCondition || "Score",
            materialsNeeded: formData.materialsNeeded || "",
            cost: formData.cost || 0,
            createdAt: new Date().toISOString(),
            suggestedBy: { 
              id: session?.user?.id || '',
              name: session?.user?.name || 'Anonymous' 
            }
          } as SuggestedGame])
        }
        
        setIsSuggestModalOpen(false)
        
        toast({
          title: "Game suggested",
          description: "Your game suggestion has been submitted successfully.",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to submit your game suggestion. Please try again.",
          variant: "destructive",
        })
      }
    })
  }

  // Actions for direct game creation by admins (this will be directed via admin page now)
  const handleCreateGame = async (formData: GameFormValues) => {
    // Redirect to admin page
    router.push("/admin/games");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {userRole === "admin" && (
          <>
            <Button onClick={() => router.push("/admin/games")} className="mr-2">
              <Plus className="mr-2 h-4 w-4" />
              Add Game
            </Button>
            <Button onClick={() => setIsSuggestModalOpen(true)} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Suggest Game
            </Button>
          </>
        )}
        {userRole !== "admin" && (
          <Button onClick={() => setIsSuggestModalOpen(true)} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Suggest Game
          </Button>
        )}
      </div>

      {/* Mobile Navigation */}
      <div className="block md:hidden">
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Games</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="suggested">Suggested</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="all">All Games</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="suggested">Suggested</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="mt-6">
        {/* All games, Available, Scheduled, Completed tabs */}
        {['all', 'available', 'scheduled', 'completed'].map(tab => (
          <div key={tab} className={activeTab === tab ? 'block' : 'hidden'}>
            <div className="relative w-full mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search games..."
                className="pl-8 w-full sm:max-w-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {filteredGames.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGames.map(game => {
                  const gameCardData = {
                    id: game.id,
                    name: game.name,
                    description: game.description,
                    type: game.type,
                    playerCount: game.playerCount,
                    duration: game.duration,
                    category: game.category,
                    status: game.status,
                    date: game.date ? new Date(game.date).toISOString() : undefined,
                    location: game.location || undefined,
                    pointsValue: game.pointsValue || undefined,
                    backupPlan: game.backupPlan || undefined,
                    team1: game.participants?.[0]?.team,
                    team2: game.participants?.[1]?.team,
                  };

                  return (
                    <GameCard
                      key={game.id}
                      game={gameCardData}
                      onView={() => handleViewGame(game.id)}
                      onStatusChange={userRole === "admin" ? (status) => handleStatusChange(game.id, status) : undefined}
                      onDelete={userRole === "admin" ? () => handleDelete(game.id) : undefined}
                    />
                  );
                })}
              </div>
            ) : (
              <Empty
                icon={<Search className="h-12 w-12 text-muted-foreground" />}
                title="No games found"
                description={`${searchQuery ? "Try a different search term or " : ""}Check back later for more games.`}
              />
            )}
          </div>
        ))}

        {/* Suggested games tab */}
        <div className={activeTab === 'suggested' ? 'block' : 'hidden'}>
          <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search suggested games..."
                className="pl-8"
                value={suggestedGamesSearchQuery}
                onChange={(e) => setSuggestedGamesSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
              <Select 
                value={suggestedGamesSortOption} 
                onValueChange={setSuggestedGamesSortOption}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="votes-desc">Most Votes</SelectItem>
                  <SelectItem value="votes-asc">Least Votes</SelectItem>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {filteredSuggestedGames.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSuggestedGames.map(game => (
                <div key={game.id} className="bg-card rounded-lg border p-4 shadow-sm flex flex-col">
                  <div className="space-y-1.5">
                    <h3 className="font-semibold">{game.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{game.description}</p>
                  </div>
                  
                  <div className="mt-2 text-xs text-muted-foreground">
                    Suggested by: {game.suggestedBy?.name || "Anonymous"}
                  </div>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className={cn(
                        "text-sm font-medium",
                        game.votes > 0 ? "text-primary" : "text-muted-foreground"
                      )}>
                        {game.votes} vote{game.votes !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      {!game.hasVoted && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleVote(game.id)}
                          disabled={isPending}
                        >
                          Vote
                        </Button>
                      )}
                      
                      {userRole === "admin" && (
                        <Button 
                          size="sm"
                          onClick={() => handleApprove(game.id)}
                          disabled={isPending}
                        >
                          Approve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              icon={<Plus className="h-12 w-12 text-muted-foreground" />}
              title="No game suggestions"
              description="Be the first to suggest a game for this year's event!"
              action={
                <Button onClick={() => setIsSuggestModalOpen(true)} variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Suggest Game
                </Button>
              }
            />
          )}
        </div>
      </div>

      {/* Game Details Modal */}
      <GameDetailsModal
        gameId={selectedGameId}
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
      />

      {/* Suggest Game Modal */}
      <Dialog open={isSuggestModalOpen} onOpenChange={setIsSuggestModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-4 sm:p-6">
          <DialogHeader className="sticky top-0 z-10 bg-background pt-0 pb-4">
            <DialogTitle>Suggest a Game</DialogTitle>
            <DialogDescription>
              Suggest a game for the upcoming event. Other participants can vote on your suggestion.
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
              pointsValue: 0
            }}
            onSubmit={handleSuggestGame}
            onCancel={() => setIsSuggestModalOpen(false)}
            isAdmin={false}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

