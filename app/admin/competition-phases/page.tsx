"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { CompetitionPhaseManager } from "@/components/admin/competition-phase-manager"
import { Suspense } from "react"
import { ProtectedRoute } from "@/components/protected-route"

export default function CompetitionPhasesPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
    <div className="container py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button variant="outline" size="sm" asChild className="mb-2">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Competition Phases</h1>
          <p className="text-muted-foreground">Manage the current phase of the competition and related settings</p>
        </div>
      </div>

      <div className="space-y-6">
        <Suspense fallback={<div>Loading competition phase manager...</div>}>
          <CompetitionPhaseManager />
        </Suspense>
      </div>
    </div>
    </ProtectedRoute>
  )
}

