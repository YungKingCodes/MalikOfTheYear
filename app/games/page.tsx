import type { Metadata } from "next"
import { Suspense } from "react"
import GamesPageClient from "./GamesPageClient"
import { GamesSkeleton } from "@/components/loading-skeletons/games-skeleton"

export const metadata: Metadata = {
  title: "Games | Malik of The Year",
  description: "Game management for Malik of The Year competition",
}

export default function GamesPage() {
  return (
    <Suspense fallback={<GamesSkeleton />}>
      <GamesPageClient />
    </Suspense>
  )
}

