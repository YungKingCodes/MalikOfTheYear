import { Suspense } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import CompetitionDetailClientPage from "./CompetitionDetailClientPage"
import { CompetitionDetailSkeleton } from "@/components/loading-skeletons/competition-detail-skeleton"

export default function CompetitionDetailPage({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute>
      <Suspense fallback={<CompetitionDetailSkeleton />}>
        <CompetitionDetailClientPage id={params.id} />
      </Suspense>
    </ProtectedRoute>
  )
} 