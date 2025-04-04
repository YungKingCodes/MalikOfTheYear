import type { Metadata } from "next"
import { Suspense } from "react"
import TeamsClientPage from "./TeamsClientPage"
import { TeamsSkeleton } from "@/components/loading-skeletons/teams-skeleton"
import { ProtectedRoute } from "@/components/protected-route"

export const metadata: Metadata = {
  title: "Teams | Malik of The Year",
  description: "Team management for Malik of The Year competition",
}

export default function TeamsPage() {
  return (
    <ProtectedRoute>
    <Suspense fallback={<TeamsSkeleton />}>
      <TeamsClientPage />
    </Suspense>
    </ProtectedRoute>
  )
}

