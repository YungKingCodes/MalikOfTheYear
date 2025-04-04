"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Award, Save, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Define the proficiency categories
const PROFICIENCY_CATEGORIES = [
  {
    name: "Basketball",
    description: "Shooting, dribbling, passing, and basketball strategy",
    icon: "🏀",
  },
  {
    name: "Soccer",
    description: "Ball control, passing, shooting, and soccer strategy",
    icon: "⚽",
  },
  {
    name: "Volleyball",
    description: "Serving, setting, spiking, and volleyball strategy",
    icon: "🏐",
  },
  {
    name: "Swimming",
    description: "Different swimming strokes, endurance, and technique",
    icon: "🏊‍♂️",
  },
  {
    name: "Running",
    description: "Speed, endurance, and running technique",
    icon: "🏃‍♂️",
  },
  {
    name: "Strategy Games",
    description: "Logical thinking, planning, and game theory",
    icon: "🎮",
  },
  {
    name: "Team Coordination",
    description: "Communication, cooperation, and team play",
    icon: "👥",
  },
  {
    name: "Leadership",
    description: "Directing, motivating, and organizing team members",
    icon: "👑",
  },
]

// Helper function to get proficiency level description
const getProficiencyDescription = (value: number) => {
  if (value < 20) return "Beginner"
  if (value < 40) return "Novice"
  if (value < 60) return "Intermediate"
  if (value < 80) return "Advanced"
  return "Expert"
}

export function PlayerProficiencyEditor() {
  const { data: session } = useSession()
  const user = session?.user
  const { toast } = useToast()
  const router = useRouter()
  const [proficiencies, setProficiencies] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isAssignedToTeam, setIsAssignedToTeam] = useState(false)

  // Load user's current proficiencies
  useEffect(() => {
    const loadProficiencies = async () => {
      setIsLoading(true)
      try {
        // In a real app, fetch from API
        // For now, use mock data
        const mockProficiencies: Record<string, number> = {}
        PROFICIENCY_CATEGORIES.forEach((category) => {
          // Generate random values for demo, or use defaults
          mockProficiencies[category.name] = Math.floor(Math.random() * 40) + 30
        })

        setProficiencies(mockProficiencies)

        // Check if user is assigned to a team
        setIsAssignedToTeam(!!user?.teamId)
      } catch (error) {
        console.error("Failed to load proficiencies:", error)
        toast({
          title: "Error",
          description: "Failed to load your proficiency data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadProficiencies()
    }
  }, [user, toast])

  // Handle proficiency change
  const handleProficiencyChange = (category: string, value: number[]) => {
    setProficiencies((prev) => ({
      ...prev,
      [category]: value[0],
    }))
  }

  // Calculate overall proficiency score
  const calculateOverallScore = () => {
    if (Object.keys(proficiencies).length === 0) return 0

    const sum = Object.values(proficiencies).reduce((acc, val) => acc + val, 0)
    return Math.round(sum / Object.keys(proficiencies).length)
  }

  // Handle save
  const handleSave = async () => {
    setIsSaving(true)
    try {
      // In a real app, save to API
      // For now, just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Proficiencies Updated",
        description: "Your proficiency scores have been successfully updated.",
      })

      // Navigate back to profile
      router.push("/player-profile")
    } catch (error) {
      console.error("Failed to save proficiencies:", error)
      toast({
        title: "Error",
        description: "Failed to save your proficiency data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Your Proficiency Scores
          </CardTitle>
          <CardDescription>Rate your proficiency in each category from 0 (beginner) to 100 (expert)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {PROFICIENCY_CATEGORIES.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{category.icon}</span>
                    <label htmlFor={`slider-${category.name}`} className="text-sm font-medium">
                      {category.name}
                    </label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0">
                            <Info className="h-3.5 w-3.5" />
                            <span className="sr-only">Info</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{category.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{proficiencies[category.name] || 0}</span>
                    <span className="text-xs text-muted-foreground">
                      ({getProficiencyDescription(proficiencies[category.name] || 0)})
                    </span>
                  </div>
                </div>
                <Slider
                  id={`slider-${category.name}`}
                  disabled={isAssignedToTeam}
                  value={[proficiencies[category.name] || 0]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) => handleProficiencyChange(category.name, value)}
                />
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t p-6">
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium">Overall Proficiency Score</p>
            <p className="text-2xl font-bold">{calculateOverallScore()}/100</p>
            <p className="text-xs text-muted-foreground">Based on average of all categories</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/player-profile")}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || isAssignedToTeam} className="gap-2">
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {isAssignedToTeam && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
          <p className="font-medium">You cannot edit your proficiencies after team assignment</p>
          <p className="text-sm mt-1">
            Since you have already been assigned to a team, your proficiency scores are locked. Contact an administrator
            if you believe your scores need adjustment.
          </p>
        </div>
      )}
    </div>
  )
}

