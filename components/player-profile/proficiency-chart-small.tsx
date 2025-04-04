"use client"

import { Progress } from "@/components/ui/progress"
import { Award } from "lucide-react"

interface ProficiencyData {
  name: string
  score: number
}

interface PlayerProficiencyChartSmallProps {
  proficiencies: ProficiencyData[]
  overallScore?: number
}

export function PlayerProficiencyChartSmall({ proficiencies, overallScore }: PlayerProficiencyChartSmallProps) {
  // Calculate overall score if not provided
  const calculatedOverallScore = overallScore || (() => {
    if (!proficiencies.length) return 0
    const sum = proficiencies.reduce((acc, prof) => acc + prof.score, 0)
    return Math.round(sum / proficiencies.length)
  })()

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {proficiencies.map((prof) => (
          <div key={prof.name} className="space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm">{prof.name}</p>
              <p className="text-sm font-medium">{prof.score}/100</p>
            </div>
            <Progress value={prof.score} className="h-1.5" />
          </div>
        ))}
      </div>

      {/* Display overall score only if we have proficiencies */}
      {proficiencies.length > 0 && (
        <div className="flex justify-between items-center pt-3 border-t">
          <p className="text-sm font-medium">Overall Score</p>
          <div className="flex items-center gap-1">
            <Award className="h-4 w-4 text-primary" />
            <span className="text-lg font-bold">{calculatedOverallScore}</span>
          </div>
        </div>
      )}
    </div>
  )
} 