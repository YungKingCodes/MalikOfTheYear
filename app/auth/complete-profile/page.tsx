import type { Metadata } from "next"
import { CompleteProfileForm } from "@/components/complete-profile-form"
import { redirect } from "next/navigation"
import { auth } from "@/auth"

export const metadata: Metadata = {
  title: "Complete Your Profile | Malik of The Year",
  description: "Complete your profile information to continue",
}

/**
 * Page for new users to complete their profile after OAuth sign-in
 */
export default async function CompleteProfilePage() {
  // Get session data
  const session = await auth()
  
  // If user is not logged in, redirect to login
  if (!session) {
    redirect("/auth/login")
  }
  
  // If user is logged in but not a new user, redirect to dashboard
  if (session && !session.user.isNewUser) {
    redirect("/dashboard")
  }
  
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <CompleteProfileForm 
        initialEmail={session.user.email}
        initialName={session.user.name || ""}
      />
    </div>
  )
} 