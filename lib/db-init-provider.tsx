"use client"

import { createContext, useContext, useEffect, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"

interface DbInitContextType {
  initialized: boolean
}

const DbInitContext = createContext<DbInitContextType>({ initialized: false })

export function DbInitProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()

  useEffect(() => {
    // Only run in production or if forced by env var
    const shouldInitDb = process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_FORCE_DB_INIT === 'true'
    
    if (shouldInitDb) {
      // Call API route to initialize database
      fetch('/api/init-db')
        .then(response => response.json())
        .then(data => {
          if (process.env.NODE_ENV === 'development') {
            if (data.success) {
              toast({
                title: "Database initialized",
                description: "Database collections have been successfully initialized.",
              })
            } else {
              toast({
                title: "Database initialization failed",
                description: data.message || "An error occurred while initializing the database.",
                variant: "destructive",
              })
            }
          }
        })
        .catch(error => {
          console.error('Failed to initialize database:', error)
          if (process.env.NODE_ENV === 'development') {
            toast({
              title: "Database initialization failed",
              description: "Failed to connect to the database. Check your connection string and make sure MongoDB is running.",
              variant: "destructive",
            })
          }
        })
    }
  }, [toast])

  return (
    <DbInitContext.Provider value={{ initialized: true }}>
      {children}
    </DbInitContext.Provider>
  )
}

export function useDbInit() {
  return useContext(DbInitContext)
} 