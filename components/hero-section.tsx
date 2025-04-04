"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Crown, Calendar, Trophy, ChevronRight, Medal } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useSession, signIn } from "next-auth/react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function HeroSection() {
  const { data: session } = useSession()
  const user = session?.user
  const isLoggedIn = !!user

  return (
    <section className="relative bg-gradient-to-b from-primary/10 via-primary/5 to-background pt-16 pb-24 md:pt-24 md:pb-32">
      <div className="container flex flex-col items-center text-center space-y-8">
        <div className="flex items-center justify-center bg-secondary/10 p-3 rounded-full">
          <Crown className="w-6 h-6 text-secondary mr-2" />
          <span className="text-sm font-medium">Malik of The Year 2025</span>
        </div>

        <div className="space-y-4 max-w-[800px]">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-secondary">
            Eid-Al-Athletes
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-[600px] mx-auto">
            The ultimate sports competition platform to crown your GOAT
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          {/* This will be client-side rendered */}
          <ClientHeroButtons />
        </div>

        <div className="relative w-full max-w-5xl mt-12 aspect-video rounded-xl overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 mix-blend-overlay z-10"></div>
          <Image
            src="/placeholder.svg?height=720&width=1280"
            alt="Malik of The Year competition dashboard"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  )
}

function ClientHeroButtons() {
  const { data: session } = useSession()
  const user = session?.user
  const isLoggedIn = !!user
  const [showSignUpDialog, setShowSignUpDialog] = useState(false)
  
  // Handle direct sign up with Google
  const handleGoogleSignUp = async () => {
    await signIn("google", { callbackUrl: "/dashboard" })
  }

  // Open the sign up dialog
  const openSignUpDialog = () => {
    setShowSignUpDialog(true)
  }

  if (isLoggedIn) {
    return (
      <Button
        asChild
        size="lg"
        className="rounded-full bg-primary hover:bg-primary/90 border-2 border-primary/20 px-8 py-6"
      >
        <Link href="/dashboard">Go to Dashboard</Link>
      </Button>
    )
  }

  return (
    <>
      <Button
        asChild
        size="lg"
        className="rounded-full bg-primary hover:bg-primary/90 border-2 border-primary/20 px-8 py-6"
      >
        <Link href="/auth/login">Sign In</Link>
      </Button>
      <Button
        onClick={openSignUpDialog}
        variant="outline"
        size="lg"
        className="rounded-full border-2 border-primary text-primary hover:bg-primary/10 px-8 py-6"
      >
        Sign Up
      </Button>
      
      {/* Sign Up Dialog */}
      <Dialog open={showSignUpDialog} onOpenChange={setShowSignUpDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign Up with Google</DialogTitle>
            <DialogDescription>
              Creating an account for Malik of The Year is quick and easy with Google.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4 py-4">
            <p>By continuing, you will:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Create a new account using your Google profile</li>
              <li>Start with the "Player" role</li>
              <li>Be able to join competitions and teams</li>
            </ul>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button variant="outline" onClick={() => setShowSignUpDialog(false)}>Cancel</Button>
            <Button onClick={handleGoogleSignUp} className="bg-primary hover:bg-primary/90">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign Up with Google
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

