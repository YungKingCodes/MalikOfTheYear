import type { Metadata } from "next"
import { Suspense } from "react"
import PlayersPage from "./players-page"
import { PlayersSkeleton } from "@/components/loading-skeletons/players-skeleton"

export const metadata: Metadata = {
  title: "Players | Malik of The Year",
  description: "Player management for Malik of The Year competition",
}

export default function Page() {
  return (
    <Suspense fallback={<PlayersSkeleton />}>
      <PlayersPage />
    </Suspense>
  )
}

