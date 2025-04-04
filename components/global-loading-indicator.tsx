"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"

// Inner component that uses searchParams
function LoadingIndicatorInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handleStart = () => setIsLoading(true)
    const handleStop = () => {
      setTimeout(() => setIsLoading(false), 300) // Small delay to ensure smooth transition
    }

    // Add event listeners for route changes
    window.addEventListener("beforeunload", handleStart)
    window.addEventListener("load", handleStop)

    // Cleanup
    return () => {
      window.removeEventListener("beforeunload", handleStart)
      window.removeEventListener("load", handleStop)
    }
  }, [])

  // Reset loading state when route changes
  useEffect(() => {
    setIsLoading(false)
  }, [pathname, searchParams])

  if (!isLoading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-transparent overflow-hidden">
      <div className="h-full bg-primary opacity-80 animate-progress"></div>
    </div>
  )
}

// Wrapper component with Suspense
export function GlobalLoadingIndicator() {
  return (
    <Suspense fallback={null}>
      <LoadingIndicatorInner />
    </Suspense>
  )
}

