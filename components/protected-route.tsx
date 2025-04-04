"use client"

import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthLoadingOverlay } from "@/components/ui/auth-loading-overlay"

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedRoute({ 
  children,
  fallback
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  useEffect(() => {
    // If the user is not authenticated and not in the loading state, redirect to login
    if (status === "unauthenticated") {
      console.log("[ProtectedRoute] User is not authenticated, redirecting to login")
      
      // Get the current URL to redirect back after login
      const returnToPath = window.location.pathname
      router.push(`/auth/login?return_to=${encodeURIComponent(returnToPath)}`)
    }
  }, [status, router])
  
  // While loading or redirecting, show the loading component
  if (status === "loading" || status === "unauthenticated") {
    return (
      <>
        <AuthLoadingOverlay className="" />
        {fallback}
      </>
    )
  }
  
  // If authenticated, show the children
  return <>{children}</>
} 