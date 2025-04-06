"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThumbsUp, ThumbsDown, CalendarDays } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FeedbackItem {
  id: string
  gameId: string
  gameName: string
  gameDate: string
  captainId: string
  captainName: string
  rating: "positive" | "negative"
  comment: string
  accolades: string[]
}

export function PlayerFeedback({ playerId }: { playerId?: string }) {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const loadFeedback = async () => {
      setLoading(true)
      try {
        // Build URL with optional playerId parameter
        const url = playerId 
          ? `/api/player-feedback?playerId=${playerId}`
          : '/api/player-feedback'
          
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error('Failed to load feedback')
        }
        
        const data = await response.json()
        setFeedback(data)
      } catch (error) {
        console.error("Failed to load feedback:", error)
        toast({
          title: "Error",
          description: "Failed to load feedback data. Please try again.",
          variant: "destructive",
        })
        
        // Fallback to empty array
        setFeedback([])
      } finally {
        setLoading(false)
      }
    }

    loadFeedback()
  }, [playerId, toast])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <div className="h-6 w-48 bg-muted rounded"></div>
                <div className="h-6 w-6 bg-muted rounded-full"></div>
              </div>
              <div className="h-4 w-32 bg-muted rounded mt-2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-16 w-full bg-muted rounded mb-4"></div>
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-muted rounded"></div>
                <div className="h-6 w-20 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Calculate feedback stats
  const positiveCount = feedback.filter((item) => item.rating === "positive").length
  const negativeCount = feedback.filter((item) => item.rating === "negative").length
  const positivePercentage = feedback.length > 0 ? Math.round((positiveCount / feedback.length) * 100) : 0

  // Get all unique accolades
  const allAccolades = feedback.flatMap((item) => item.accolades)
  const accoladeCounts: Record<string, number> = {}
  allAccolades.forEach((accolade) => {
    accoladeCounts[accolade] = (accoladeCounts[accolade] || 0) + 1
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Captain Feedback Summary</CardTitle>
          <CardDescription>Performance ratings from your team captain</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <ThumbsUp className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">{positiveCount}</span>
              </div>
              <span className="text-sm text-muted-foreground">Positive Ratings</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <ThumbsDown className="h-5 w-5 text-red-500" />
                <span className="text-2xl font-bold">{negativeCount}</span>
              </div>
              <span className="text-sm text-muted-foreground">Negative Ratings</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
              <span className="text-2xl font-bold">{positivePercentage}%</span>
              <span className="text-sm text-muted-foreground">Positive Rating Percentage</span>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium mb-3">Most Received Accolades</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(accoladeCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([accolade, count]) => (
                  <Badge key={accolade} variant="secondary" className="flex items-center gap-1">
                    {accolade} <span className="text-xs opacity-70">×{count}</span>
                  </Badge>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {feedback.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No feedback available yet</p>
            </CardContent>
          </Card>
        ) : (
          feedback.map((item) => (
            <Card key={item.id} className={item.rating === "positive" ? "border-green-200" : "border-red-200"}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{item.gameName}</CardTitle>
                  {item.rating === "positive" ? (
                    <ThumbsUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <ThumbsDown className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <CardDescription className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {new Date(item.gameDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{item.comment}</p>
                {item.accolades.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.accolades.map((accolade) => (
                      <Badge key={accolade} variant="outline">
                        {accolade}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

