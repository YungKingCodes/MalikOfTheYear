"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface GameFormProps {
  game?: {
    id?: string
    name: string
    description: string
    type: string
    playerCount: number
    duration: number
    category: string
    status: string
    date?: string
    location?: string
    pointsValue?: number
    backupPlan?: string
    competitionId?: string
    difficulty?: string
    winCondition?: string
    materialsNeeded?: string
    cost?: number
  }
  onSubmit: (data: any) => Promise<any>
  onCancel: () => void
  isAdmin?: boolean
  competitions?: Array<{id: string, name: string, year: number}>
}

export function GameForm({ game, onSubmit, onCancel, isAdmin = false, competitions = [] }: GameFormProps) {
  const [formData, setFormData] = useState({
    name: game?.name || "",
    description: game?.description || "",
    type: game?.type || "Team Sport",
    playerCount: game?.playerCount || 0,
    duration: game?.duration || 30,
    category: game?.category || "Physical",
    status: game?.status || "available",
    date: game?.date ? new Date(game.date) : undefined,
    location: game?.location || "",
    pointsValue: game?.pointsValue || 0,
    backupPlan: game?.backupPlan || "",
    competitionId: game?.competitionId || "",
    difficulty: game?.difficulty || "Medium",
    winCondition: game?.winCondition || "Score",
    materialsNeeded: game?.materialsNeeded || "",
    cost: game?.cost || 0
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field: string, value: any) => {
    // Special handling for competitionId to convert "none" to empty string
    if (field === "competitionId" && value === "none") {
      setFormData(prev => ({
        ...prev,
        [field]: ""
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Create a copy of formData with proper date formatting
      const formDataToSubmit = {
        ...formData,
        // Convert Date object to ISO string if it exists
        date: formData.date ? formData.date.toISOString() : undefined,
        // Make sure competitionId is undefined (not empty string) if "none" was selected
        competitionId: formData.competitionId === "none" || formData.competitionId === "" ? undefined : formData.competitionId
      }
      
      const success = await onSubmit(formDataToSubmit)
      if (success) {
        // If the parent component doesn't handle navigation (success = true),
        // we'll do a clean-up here by resetting form state
        if (typeof success === 'boolean') {
          setFormData({
            name: "",
            description: "",
            type: "Team Sport",
            playerCount: 0,
            duration: 30,
            category: "Physical",
            status: "available",
            date: undefined,
            location: "",
            pointsValue: 0,
            backupPlan: "",
            competitionId: "",
            difficulty: "Medium",
            winCondition: "Score",
            materialsNeeded: "",
            cost: 0
          })
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Game Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Game Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleChange("type", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select game type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Team Sport">Team Sport</SelectItem>
              <SelectItem value="Individual">Individual</SelectItem>
              <SelectItem value="Relay">Relay</SelectItem>
              <SelectItem value="Strategy">Strategy</SelectItem>
              <SelectItem value="Esports">Esports</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleChange("category", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Physical">Physical</SelectItem>
              <SelectItem value="Mental">Mental</SelectItem>
              <SelectItem value="Team Building">Team Building</SelectItem>
              <SelectItem value="Fun">Fun</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="playerCount">Number of Players *</Label>
          <Input
            id="playerCount"
            type="number"
            min="0"
            value={formData.playerCount}
            onChange={(e) => handleChange("playerCount", parseInt(e.target.value) || 0)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes) *</Label>
          <Input
            id="duration"
            type="number"
            min="5"
            value={formData.duration}
            onChange={(e) => handleChange("duration", parseInt(e.target.value) || 30)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty *</Label>
          <Select
            value={formData.difficulty}
            onValueChange={(value) => handleChange("difficulty", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="winCondition">Win Condition *</Label>
          <Select
            value={formData.winCondition}
            onValueChange={(value) => handleChange("winCondition", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select win condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Score">Score Based</SelectItem>
              <SelectItem value="Elimination">Elimination Based</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="materialsNeeded">Materials Needed</Label>
        <Textarea
          id="materialsNeeded"
          value={formData.materialsNeeded}
          onChange={(e) => handleChange("materialsNeeded", e.target.value)}
          rows={2}
          placeholder="List any materials or equipment needed for the game"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cost">Estimated Cost ($)</Label>
        <Input
          id="cost"
          type="number"
          min="0"
          step="0.01"
          value={formData.cost}
          onChange={(e) => handleChange("cost", parseFloat(e.target.value) || 0)}
        />
      </div>

      {isAdmin && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="selected">Selected</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">Points Value</Label>
              <Input
                id="points"
                type="number"
                min="0"
                value={formData.pointsValue}
                onChange={(e) => handleChange("pointsValue", parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {competitions.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="competition">Competition</Label>
                <Select
                  value={formData.competitionId || "none"}
                  onValueChange={(value) => handleChange("competitionId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a competition (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Available in Game Pool)</SelectItem>
                    {competitions.map((comp) => (
                      <SelectItem key={comp.id} value={comp.id}>
                        {comp.name} ({comp.year})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Assigning a game to a competition will make it available for scheduling
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Scheduled Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => handleChange("date", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
              />
            </div>
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="backupPlan">Backup Plan</Label>
        <Textarea
          id="backupPlan"
          value={formData.backupPlan}
          onChange={(e) => handleChange("backupPlan", e.target.value)}
          rows={2}
          placeholder="Alternative plans in case of weather issues, etc."
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting 
            ? "Saving..." 
            : game?.id 
              ? "Update Game" 
              : isAdmin 
                ? "Add Game" 
                : "Suggest Game"
          }
        </Button>
      </div>
    </form>
  )
} 