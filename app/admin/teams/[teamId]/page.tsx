import { Suspense } from "react"
import { TeamDetailsClient } from "./team-details-client"

export default function TeamDetailsPage({ params }: { params: { teamId: string } }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TeamDetailsClient teamId={params.teamId} />
    </Suspense>
  )
} 