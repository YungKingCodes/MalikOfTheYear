import { Suspense } from "react"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { getGames, getSuggestedGames } from "@/app/actions/games"
import { GamesPageClient } from "./GamesPageClient"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Games | Event Management",
  description: "Browse and manage games for your events",
}

export default async function GamesPage() {
  const session = await auth()
  
  // Check if user is authorized to view this page
  if (!session?.user) {
    redirect("/auth/login")
  }
  
  // Fetch games and suggested games in parallel
  const [gamesData, suggestedGamesData] = await Promise.all([
    getGames(),
    getSuggestedGames()
  ]).catch(error => {
    console.error("Error fetching games data:", error)
    return [[], []]
  })

  // Transform suggested games to ensure compatibility with the client component
  const transformedSuggestedGames = suggestedGamesData.map(game => ({
    id: game.id,
    name: game.name,
    description: game.description,
    type: game.type || "",
    category: game.category || "Other",
    playerCount: game.playerCount || 0,
    duration: game.duration || 30,
    backupPlan: game.backupPlan || undefined,
    difficulty: game.difficulty || "Medium",
    winCondition: game.winCondition || "Score",
    materialsNeeded: game.materialsNeeded || undefined,
    cost: game.cost || 0,
    votes: game.votes,
    hasVoted: !!game.hasVoted,
    createdAt: game.createdAt || new Date().toISOString(),
    suggestedBy: {
      id: game.suggestedBy.id,
      name: game.suggestedBy.name || ""
    }
  }))

  return (
    <ProtectedRoute allowedRoles={["admin", "captain", "player"]}>
      <div className="container py-6 md:py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Games</h1>
          <p className="text-muted-foreground mt-1">
            Browse, vote, and suggest games for the upcoming event
          </p>
        </div>
        
        <Suspense fallback={<GamesPageSkeleton />}>
          <GamesPageClient 
            initialGames={gamesData} 
            initialSuggestedGames={transformedSuggestedGames}
            userRole={session.user.role || "player"} 
          />
        </Suspense>
      </div>
    </ProtectedRoute>
  )
}

function GamesPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Skeleton className="h-10 w-full sm:w-80" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      <Skeleton className="h-10 w-full sm:w-96" />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(6).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-52 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

