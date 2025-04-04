import type { Metadata } from "next"
import { Suspense } from "react"
import CompetitionsClientPage from "./CompetitionsClientPage"
import { ProtectedRoute } from "@/components/protected-route"
import { CompetitionsSkeleton } from "@/components/loading-skeletons/competitions-skeleton"

export const metadata: Metadata = {
  title: "Competitions | Malik of The Year",
  description: "Competition management for Malik of The Year",
}

export default function CompetitionsPage() {
  return (
    <Suspense fallback={<CompetitionsSkeleton />}>
      <ProtectedRoute fallback={<CompetitionsSkeleton />}>
        <CompetitionsClientPage />
      </ProtectedRoute>
    </Suspense>
  )
}

