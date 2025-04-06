"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"

export default function CompetitionPhasesPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the phases tab in the new event management page
    router.push("/admin/event-management?tab=phases")
  }, [router])

  return (
    <ProtectedRoute>
      <div className="container py-8 flex justify-center items-center">
        <p>Redirecting to Event Management...</p>
      </div>
    </ProtectedRoute>
  )
}

