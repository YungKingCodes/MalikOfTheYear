import type { Metadata } from "next"
import DashboardClientPage from "./DashboardClientPage"
import { ProtectedRoute } from "@/components/protected-route"

export const metadata: Metadata = {
  title: "Dashboard | Malik of The Year",
  description: "Competition dashboard for Malik of The Year",
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardClientPage />
    </ProtectedRoute>
  )
}

