"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"

export default function CompetitionSettingsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new event management page
    router.push("/admin/event-management")
  }, [router])

  return (
    <ProtectedRoute>
      <div className="container py-8 flex justify-center items-center">
        <p>Redirecting to Event Management...</p>
      </div>
    </ProtectedRoute>
  )
}

