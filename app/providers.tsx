"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";

// Create a context to expose loading state globally
export const AuthLoadingContext = createContext<boolean>(true);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthStatusProvider>
        {children}
      </AuthStatusProvider>
    </SessionProvider>
  );
}

// This component wraps the app content and manages global auth loading state
function AuthStatusProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Mark as not loading once the session status is determined
    if (status !== "loading") {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 100);
      
      return () => clearTimeout(timer);
    }
    
    // Force reset loading state after a maximum of 3 seconds
    // This is a safety mechanism to prevent infinite loading
    const maxWaitTimer = setTimeout(() => {
      if (isLoading) {
        console.log("Maximum wait time exceeded, forcing loading state to false");
        setIsLoading(false);
      }
    }, 3000);
    
    return () => clearTimeout(maxWaitTimer);
  }, [status, isLoading]);
  
  return (
    <AuthLoadingContext.Provider value={isLoading}>
      {children}
    </AuthLoadingContext.Provider>
  );
}

// Utility hook to access the auth loading state
export function useAuthLoading() {
  return useContext(AuthLoadingContext);
} 