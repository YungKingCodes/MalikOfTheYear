"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Medal, Star, Award, Crown } from "lucide-react"
import { getUserAchievements } from '@/app/actions/dashboard-stats'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  competition: string
  date: string
  highlight?: boolean
}

export function PlayerAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAchievements = async () => {
      setLoading(true)
      try {
        const data = await getUserAchievements()
        setAchievements(data)
      } catch (error) {
        console.error("Failed to load achievements:", error)
      } finally {
        setLoading(false)
      }
    }

    loadAchievements()
  }, [])

  // Helper function to render the correct icon
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "Trophy":
        return <Trophy className="h-5 w-5 text-primary" />
      case "Medal":
        return <Medal className="h-5 w-5 text-muted-foreground" />
      case "Star":
        return <Star className="h-5 w-5 text-muted-foreground" />
      case "Crown":
        return <Crown className="h-5 w-5 text-muted-foreground" />
      case "Award":
      default:
        return <Award className="h-5 w-5 text-muted-foreground" />
    }
  }

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-6 w-32 bg-muted rounded mb-2"></div>
              <div className="h-4 w-48 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 w-full bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {achievements.map((achievement) => (
        <Card key={achievement.id} className={achievement.highlight ? "bg-primary/5 border-primary/20" : ""}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{achievement.title}</CardTitle>
              {renderIcon(achievement.icon)}
            </div>
            <CardDescription>{achievement.competition}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className={`text-sm ${achievement.highlight ? "text-primary-foreground" : "text-muted-foreground"}`}>
              {achievement.description}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Awarded: {formatDate(achievement.date)}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

