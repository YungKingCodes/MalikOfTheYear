"use client"

import { Button } from "@/components/ui/button"
import { ClipboardList } from "lucide-react"
import { useSession } from "next-auth/react"

export function GameReviewButton({ gameId }: { gameId: string }) {
  const { data: session } = useSession()
  const user = session?.user

  // Only team captains can review games
  if (user?.role !== "captain") return null

  return (
    <Button asChild>
      <a href={`/games/${gameId}/review`} className="flex items-center gap-2">
        <ClipboardList className="h-4 w-4" />
        Review Game
      </a>
    </Button>
  )
}

