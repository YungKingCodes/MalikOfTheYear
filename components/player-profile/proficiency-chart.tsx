"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Award } from "lucide-react"

// Define the proficiency categories
const PROFICIENCY_CATEGORIES = [
  {
    name: "Basketball",
    icon: "🏀",
  },
  {
    name: "Soccer",
    icon: "⚽",
  },
  {
    name: "Volleyball",
    icon: "🏐",
  },
  {
    name: "Swimming",
    icon: "🏊‍♂️",
  },
  {
    name: "Running",
    icon: "🏃‍♂️",
  },
  {
    name: "Strategy Games",
    icon: "🎮",
  },
  {
    name: "Team Coordination",
    icon: "👥",
  },
  {
    name: "Leadership",
    icon: "👑",
  },
]

export function PlayerProficiencyChart() {
  const [proficiencies, setProficiencies] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, fetch from API
    // For now, use mock data
    const loadProficiencies = async () => {
      setLoading(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Mock data
        const mockProficiencies: Record<string, number> = {
          Basketball: 95,
          Soccer: 90,
          Volleyball: 85,
          Swimming: 80,
          Running: 95,
          "Strategy Games": 85,
          "Team Coordination": 98,
          Leadership: 92,
        }

        setProficiencies(mockProficiencies)
      } catch (error) {
        console.error("Failed to load proficiencies:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProficiencies()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        {PROFICIENCY_CATEGORIES.map((category, index) => (
          <div key={index} className="space-y-2 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-5 w-32 bg-muted rounded"></div>
              <div className="h-5 w-16 bg-muted rounded"></div>
            </div>
            <div className="h-2 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  // Calculate overall score
  const calculateOverallScore = () => {
    if (Object.keys(proficiencies).length === 0) return 0

    const sum = Object.values(proficiencies).reduce((acc, val) => acc + val, 0)
    return Math.round(sum / Object.keys(proficiencies).length)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {PROFICIENCY_CATEGORIES.map((category) => (
          <div key={category.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{category.icon}</span>
                <p className="text-sm font-medium">{category.name}</p>
              </div>
              <p className="text-sm font-medium">{proficiencies[category.name] || 0}/100</p>
            </div>
            <Progress value={proficiencies[category.name] || 0} className="h-2" />
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <div>
          <p className="text-sm font-medium">Overall Proficiency Score</p>
          <p className="text-xs text-muted-foreground">Based on weighted average of all skills</p>
        </div>
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <div className="text-2xl font-bold">{calculateOverallScore()}</div>
        </div>
      </div>
    </div>
  )
}

