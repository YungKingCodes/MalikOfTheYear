"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Crown, Calendar, Trophy, ChevronRight, Medal } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"

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
        asChild
        variant="outline"
        size="lg"
        className="rounded-full border-2 border-primary text-primary hover:bg-primary/10 px-8 py-6"
      >
        <Link href="/auth/login">Sign Up</Link>
      </Button>
    </>
  )
}

