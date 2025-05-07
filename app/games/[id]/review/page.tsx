"use client"

import { use } from "react"
import type { Metadata } from "next"
import { CaptainGameReview } from "@/components/games/captain-game-review"

export const metadata: Metadata = {
  title: "Game Review | Malik of The Year",
  description: "Review player performance for Malik of The Year competition",
}

export default function GameReviewPage({ params }: { params: { id: string } }) {
  const gameId = use(Promise.resolve(params.id))
  return (
    <div className="container py-8 space-y-8 animate-in fade-in-50 duration-500">
      <h1 className="text-3xl font-bold tracking-tight">Game Performance Review</h1>
      <p className="text-muted-foreground max-w-3xl">
        As team captain, you can provide feedback and accolades to your team members based on their performance in this
        game. Your feedback helps players understand their strengths and areas for improvement.
      </p>

      <CaptainGameReview gameId={gameId} />
    </div>
  )
}

