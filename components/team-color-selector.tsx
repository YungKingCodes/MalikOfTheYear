"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Paintbrush } from "lucide-react"

interface TeamColor {
  id: string
  name: string
  bgClass: string
  textClass: string
  borderClass: string
  taken: boolean
  teamId?: string
}

interface TeamColorSelectorProps {
  competitionId: string;
}

export function TeamColorSelector({ competitionId }: TeamColorSelectorProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [colors, setColors] = useState<TeamColor[]>([
    {
      id: "red",
      name: "Red",
      bgClass: "bg-team-red",
      textClass: "text-team-red",
      borderClass: "border-team-red",
      taken: true,
      teamId: "team1",
    },
    {
      id: "blue",
      name: "Blue",
      bgClass: "bg-team-blue",
      textClass: "text-team-blue",
      borderClass: "border-team-blue",
      taken: true,
      teamId: "team2",
    },
    {
      id: "green",
      name: "Green",
      bgClass: "bg-team-green",
      textClass: "text-team-green",
      borderClass: "border-team-green",
      taken: true,
      teamId: "team3",
    },
    {
      id: "yellow",
      name: "Yellow",
      bgClass: "bg-team-yellow",
      textClass: "text-team-yellow",
      borderClass: "border-team-yellow",
      taken: true,
      teamId: "team4",
    },
    {
      id: "purple",
      name: "Purple",
      bgClass: "bg-team-purple",
      textClass: "text-team-purple",
      borderClass: "border-team-purple",
      taken: false,
    },
    {
      id: "orange",
      name: "Orange",
      bgClass: "bg-team-orange",
      textClass: "text-team-orange",
      borderClass: "border-team-orange",
      taken: false,
    },
    {
      id: "teal",
      name: "Teal",
      bgClass: "bg-team-teal",
      textClass: "text-team-teal",
      borderClass: "border-team-teal",
      taken: false,
    },
    {
      id: "pink",
      name: "Pink",
      bgClass: "bg-team-pink",
      textClass: "text-team-pink",
      borderClass: "border-team-pink",
      taken: false,
    },
  ])

  const user = session?.user
  const isCaptain = user?.role === "captain"
  const userTeamId = user?.teamId
  const userTeamColor = colors.find((color) => color.teamId === userTeamId)

  const handleSelectColor = (colorId: string) => {
    if (!isCaptain) {
      toast({
        title: "Permission Denied",
        description: "Only team captains can select team colors.",
        variant: "destructive",
      })
      return
    }

    if (!userTeamId) {
      toast({
        title: "Team Required",
        description: "You must be assigned to a team to select a color.",
        variant: "destructive",
      })
      return
    }

    // Check if the color is already taken
    const selectedColor = colors.find((c) => c.id === colorId)
    if (selectedColor?.taken && selectedColor.teamId !== userTeamId) {
      toast({
        title: "Color Unavailable",
        description: `${selectedColor.name} is already taken by another team.`,
        variant: "destructive",
      })
      return
    }

    // If the team already has a color, remove it first
    if (userTeamColor) {
      setColors((prevColors) =>
        prevColors.map((c) => (c.id === userTeamColor.id ? { ...c, taken: false, teamId: undefined } : c)),
      )
    }

    // Assign the new color to the team
    setColors((prevColors) => prevColors.map((c) => (c.id === colorId ? { ...c, taken: true, teamId: userTeamId } : c)))

    toast({
      title: "Color Selected",
      description: `Your team color has been updated to ${selectedColor?.name}.`,
    })

    // In a real implementation, this would call an API endpoint to update the team's color
    console.log(`Team ${userTeamId} selected color ${colorId}`)
  }

  // Only show this component to team captains of active teams
  if (!isCaptain) return null

  return (
    <Card className="mt-8 border-secondary/20 bg-gradient-to-br from-white to-secondary/5">
      <CardHeader>
        <CardTitle className="text-gradient bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Team Color Selection
        </CardTitle>
        <CardDescription>
          As a team captain, you can select your team's color. Colors are assigned on a first-come, first-serve basis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {userTeamColor && (
            <div className="p-4 rounded-md border border-accent/20 bg-accent/5">
              <p className="font-medium mb-2">Your Current Team Color</p>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${userTeamColor.bgClass} shadow-md`}></div>
                <span>{userTeamColor.name}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {colors.map((color) => (
              <div
                key={color.id}
                className={`p-4 rounded-md border transition-all duration-300 ${color.taken && color.teamId !== userTeamId ? "opacity-50" : ""} ${color.teamId === userTeamId ? `border-2 ${color.borderClass} shadow-md` : "hover:shadow-md"}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-6 h-6 rounded-full ${color.bgClass} shadow-sm`}></div>
                  <span className="font-medium">{color.name}</span>
                </div>
                {color.taken ? (
                  color.teamId === userTeamId ? (
                    <span className="text-xs text-green-600">Selected by your team</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">Already taken</span>
                  )
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className={`w-full mt-2 ${color.textClass} hover:${color.bgClass} hover:text-white transition-colors duration-300`}
                    onClick={() => handleSelectColor(color.id)}
                  >
                    Select
                  </Button>
                )}
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            Note: Once selected, your team color will be visible to all participants and will be used in competition
            materials.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

