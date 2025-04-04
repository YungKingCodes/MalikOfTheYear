"use client"

import { useAuthLoading } from "@/app/providers"
import { Crown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface AuthLoadingOverlayProps {
  className?: string
  timeout?: number
}

/**
 * A component that displays a loading overlay when the auth state is being determined
 * This prevents the UI from briefly showing unauthenticated state before session loads
 */
export function AuthLoadingOverlay({ 
  className,
  timeout = 5000 
}: AuthLoadingOverlayProps) {
  const isAuthLoading = useAuthLoading()
  const [visible, setVisible] = useState(true)
  const [forceHide, setForceHide] = useState(false)
  
  // Handle smooth transition when loading completes
  useEffect(() => {
    if (!isAuthLoading) {
      // Add a slight delay before hiding to allow for transition
      const timer = setTimeout(() => {
        setVisible(false)
      }, 500)
      
      return () => clearTimeout(timer)
    } else {
      setVisible(true)
    }
    
    // Safety timeout - force hide after specified timeout
    const safetyTimer = setTimeout(() => {
      console.log("Auth loading overlay safety timeout reached")
      setForceHide(true)
      setVisible(false)
    }, timeout)
    
    return () => clearTimeout(safetyTimer)
  }, [isAuthLoading, timeout])
  
  // If not visible at all, don't render
  if ((!visible && !isAuthLoading) || forceHide) return null

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm transition-all duration-500",
        (isAuthLoading && !forceHide) ? "opacity-100" : "opacity-0 pointer-events-none",
        className
      )}
    >
      <div className="flex flex-col items-center space-y-4">
        <Crown className="h-12 w-12 text-primary animate-pulse" />
        <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-primary animate-progress-indeterminate" />
        </div>
      </div>
    </div>
  )
}

// Add this to your global CSS file
// .animate-progress-indeterminate {
//   animation: progress-indeterminate 1.5s ease-in-out infinite;
// }
// 
// @keyframes progress-indeterminate {
//   0% {
//     transform: translateX(-100%);
//     width: 50%;
//   }
//   100% {
//     transform: translateX(200%);
//     width: 50%;
//   }
// } 