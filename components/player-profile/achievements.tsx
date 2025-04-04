"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Medal, Star, Award, Crown } from "lucide-react"

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
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
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Mock data
        const mockAchievements: Achievement[] = [
          {
            id: "1",
            title: "The GOAT",
            description:
              "Awarded to the most valuable player of the entire competition. This is the highest honor in the Malik of The Year competition.",
            icon: <Trophy className="h-5 w-5 text-primary" />,
            competition: "2024 Royal Rumble",
            date: "July 25, 2024",
            highlight: true,
          },
          {
            id: "2",
            title: "MVP",
            description:
              "Awarded to the most valuable player on a team. Recognizes exceptional individual performance.",
            icon: <Medal className="h-5 w-5 text-muted-foreground" />,
            competition: "2023 Desert Kings",
            date: "July 20, 2023",
          },
          {
            id: "3",
            title: "Rookie of the Year",
            description:
              "Awarded to the best performing first-time participant. Recognizes exceptional talent in new competitors.",
            icon: <Star className="h-5 w-5 text-muted-foreground" />,
            competition: "2022 Jungle Monarchs",
            date: "July 15, 2022",
          },
          {
            id: "4",
            title: "Team Captain",
            description:
              "Elected by team members to lead the Mountain Goats. Responsible for team strategy and coordination.",
            icon: <Crown className="h-5 w-5 text-muted-foreground" />,
            competition: "2024-2025",
            date: "May 1, 2024",
          },
          {
            id: "5",
            title: "Perfect Game",
            description: "Achieved a perfect score in the Basketball Tournament.",
            icon: <Award className="h-5 w-5 text-muted-foreground" />,
            competition: "2024 Royal Rumble",
            date: "June 10, 2024",
          },
          {
            id: "6",
            title: "Team Spirit",
            description: "Recognized for exceptional team spirit and motivation.",
            icon: <Award className="h-5 w-5 text-muted-foreground" />,
            competition: "2023 Desert Kings",
            date: "June 15, 2023",
          },
        ]

        setAchievements(mockAchievements)
      } catch (error) {
        console.error("Failed to load achievements:", error)
      } finally {
        setLoading(false)
      }
    }

    loadAchievements()
  }, [])

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
              {achievement.icon}
            </div>
            <CardDescription>{achievement.competition}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className={`text-sm ${achievement.highlight ? "text-primary-foreground" : "text-muted-foreground"}`}>
              {achievement.description}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Awarded: {achievement.date}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

