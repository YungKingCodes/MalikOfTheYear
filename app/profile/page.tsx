import type { Metadata } from "next"
import { UserAuthForm } from "@/components/auth/user-auth-form"
import { ProtectedRoute } from "@/components/protected-route"

export const metadata: Metadata = {
  title: "Profile | Malik of The Year",
  description: "View and manage your Malik of The Year profile",
}

export default function ProfilePage() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-lg space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-muted-foreground">View and manage your account details</p>
        </div>
        
        {/* Protected client component - only authenticated users can see */}
        <ProtectedRoute>
          <UserAuthForm />
        </ProtectedRoute>
      </div>
    </div>
  )
} 