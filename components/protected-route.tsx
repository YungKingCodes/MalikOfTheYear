"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

type UserRole = "admin" | "captain" | "player" | "guest"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  teamId?: string // If specified, check if user belongs to this team
}

export function ProtectedRoute({ 
  children, 
  allowedRoles = ["admin", "captain", "player"],
  teamId
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const isLoading = status === "loading"
  
  useEffect(() => {
    // If authentication is still loading, do nothing yet
    if (isLoading) return
    
    // If not authenticated, redirect to login
    if (status !== "authenticated") {
      router.push("/auth/login")
      return
    }
    
    // If role restriction is in place
    if (allowedRoles.length > 0) {
      const userRole = session?.user?.role || "guest"
      
      if (!allowedRoles.includes(userRole as UserRole)) {
        router.push("/unauthorized")
        return
      }
    }
    
    // If team restriction is in place and user is not admin
    if (teamId && session?.user?.role !== "admin") {
      // If user is a team captain or player, they must belong to the specified team
      if (session?.user?.teamId !== teamId) {
        router.push("/unauthorized")
        return
      }
    }
  }, [isLoading, router, status, session, allowedRoles, teamId])
  
  // Show loading while authentication is being checked
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  }
  
  // If authentication passed and all checks are successful, render the protected content
  if (status === "authenticated") {
    return <>{children}</>
  }
  
  // For any other case, show nothing while redirecting
  return null
} 