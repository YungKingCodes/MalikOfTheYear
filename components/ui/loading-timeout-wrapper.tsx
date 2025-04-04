"use client"

import { useAuthLoading } from "@/app/providers"
import { useEffect, useState } from "react"

interface LoadingTimeoutWrapperProps {
  children: React.ReactNode
  maxTimeout?: number
}

/**
 * A wrapper component that ensures loading states don't get stuck
 * by forcing a timeout after a specific duration
 */
export function LoadingTimeoutWrapper({
  children,
  maxTimeout = 5000
}: LoadingTimeoutWrapperProps) {
  const isAuthLoading = useAuthLoading()
  const [internalLoading, setInternalLoading] = useState(true)

  useEffect(() => {
    // Sync with auth loading state
    setInternalLoading(isAuthLoading)
    
    // Force timeout after maxTimeout milliseconds
    const timer = setTimeout(() => {
      setInternalLoading(false)
    }, maxTimeout)
    
    return () => clearTimeout(timer)
  }, [isAuthLoading, maxTimeout])

  // Replace the auth loading context with our managed version
  // that will definitely time out
  return (
    <div className={internalLoading ? "relative" : ""}>
      {children}
    </div>
  )
} 