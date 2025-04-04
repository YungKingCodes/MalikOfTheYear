"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { CalendarIcon, Save, Plus, Trash2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface DeadlineEvent {
  id: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  type: "registration" | "team-formation" | "captain-voting" | "game-selection" | "competition" | "awards"
}

export function CompetitionDeadlineEditor() {
  const { toast } = useToast()
  const [events, setEvents] = useState<DeadlineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      try {
        // In a real app, fetch from API
        // For now, use mock data
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Mock events data
        const mockEvents: DeadlineEvent[] = [
          {
            id: "event1",
            title: "Player Registration",
            description: "Register as a player for the competition",
            startDate: new Date("2025-05-01"),
            endDate: new Date("2025-05-15"),
            type: "registration",
          },
          {
            id: "event2",
            title: "Team Formation",
            description: "Teams are formed based on player proficiencies",
            startDate: new Date("2025-05-16"),
            endDate: new Date("2025-05-25"),
            type: "team-formation",
          },
          {
            id: "event3",
            title: "Captain Voting",
            description: "Team members vote for their captains",
            startDate: new Date("2025-05-26"),
            endDate: new Date("2025-06-01"),
            type: "captain-voting",
          },
          {
            id: "event4",
            title: "Game Selection",
            description: "Teams select which games they will participate in",
            startDate: new Date("2025-06-02"),
            endDate: new Date("2025-06-10"),
            type: "game-selection",
          },
          {
            id: "event5",
            title: "Competition Phase",
            description: "Games and matches take place",
            startDate: new Date("2025-06-15"),
            endDate: new Date("2025-07-15"),
            type: "competition",
          },
          {
            id: "event6",
            title: "Awards Ceremony",
            description: "Recognition of winners and outstanding performances",
            startDate: new Date("2025-07-20"),
            endDate: new Date("2025-07-20"),
            type: "awards",
          },
        ]

        setEvents(mockEvents)
      } catch (error) {
        console.error("Failed to fetch events:", error)
        toast({
          title: "Error",
          description: "Failed to load deadline events. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [toast])

  const handleEventChange = (id: string, field: keyof DeadlineEvent, value: any) => {
    setEvents((prev) => prev.map((event) => (event.id === id ? { ...event, [field]: value } : event)))
  }

  const addNewEvent = () => {
    const newEvent: DeadlineEvent = {
      id: `event${events.length + 1}`,
      title: "New Event",
      description: "",
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      type: "registration",
    }

    setEvents((prev) => [...prev, newEvent])
  }

  const removeEvent = (id: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== id))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // In a real app, save to API
      // For now, just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Deadlines Updated",
        description: "Competition deadlines have been updated successfully.",
      })
    } catch (error) {
      console.error("Failed to save deadlines:", error)
      toast({
        title: "Error",
        description: "Failed to save deadlines. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Edit Deadlines</CardTitle>
          <CardDescription>Loading deadline events...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Deadlines</CardTitle>
        <CardDescription>Set and modify competition deadlines and key dates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {events.map((event) => (
            <div key={event.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <Label htmlFor={`title-${event.id}`}>Event Title</Label>
                  <Input
                    id={`title-${event.id}`}
                    value={event.title}
                    onChange={(e) => handleEventChange(event.id, "title", e.target.value)}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEvent(event.id)}
                  className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <Label htmlFor={`description-${event.id}`}>Description</Label>
                <Textarea
                  id={`description-${event.id}`}
                  value={event.description}
                  onChange={(e) => handleEventChange(event.id, "description", e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !event.startDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {event.startDate ? format(event.startDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={event.startDate}
                        onSelect={(date) => handleEventChange(event.id, "startDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !event.endDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {event.endDate ? format(event.endDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={event.endDate}
                        onSelect={(date) => handleEventChange(event.id, "endDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <Label htmlFor={`type-${event.id}`}>Event Type</Label>
                <select
                  id={`type-${event.id}`}
                  value={event.type}
                  onChange={(e) => handleEventChange(event.id, "type", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="registration">Player Registration</option>
                  <option value="team-formation">Team Formation</option>
                  <option value="captain-voting">Captain Voting</option>
                  <option value="game-selection">Game Selection</option>
                  <option value="competition">Competition Phase</option>
                  <option value="awards">Awards Ceremony</option>
                </select>
              </div>
            </div>
          ))}

          <Button variant="outline" onClick={addNewEvent} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add New Event
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? (
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
      </CardFooter>
    </Card>
  )
}

