"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ThumbsUp, Clock, CheckCircle, Search, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import { getFeedback, voteFeedback, updateFeedbackStatus } from "@/app/actions/feedback"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

// Define interfaces for our data types
interface FeedbackItem {
  id: string
  title: string
  description: string
  category: string
  status: string
  votes: number
  userId: string
  createdAt: Date
  user: {
    id: string
    name: string | null
    image: string | null
  }
  hasVoted: boolean
}

export function FeedbackList() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { data: session, status } = useSession()
  const router = useRouter()
  const user = session?.user
  const [filteredFeedback, setFilteredFeedback] = useState<FeedbackItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [votingId, setVotingId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const { toast } = useToast()
  const isAdmin = user?.role === "admin"

  // Load feedback data on initial render
  useEffect(() => {
    const loadFeedback = async () => {
      try {
        setLoading(true)
        // Only try to load feedback if we have a session
        if (status === "authenticated") {
          const data = await getFeedback()
          setFeedback(data)
        } else if (status === "unauthenticated") {
          // Redirect to login if not authenticated
          router.push("/auth/login")
        }
      } catch (err) {
        console.error("Failed to load feedback:", err)
        setError("Failed to load feedback. Please try again later.")
        toast({
          title: "Error",
          description: "Failed to load feedback. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadFeedback()
  }, [status, router, toast])

  // Filter feedback based on search and tab
  useEffect(() => {
    // Filter feedback based on search query and active tab
    let filtered = [...feedback]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) => item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query),
      )
    }

    // Apply tab filter
    if (activeTab !== "all") {
      filtered = filtered.filter((item) => item.status === activeTab)
    }

    setFilteredFeedback(filtered)
  }, [searchQuery, activeTab, feedback])

  const handleVote = async (id: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to vote on feedback.",
        variant: "destructive",
      })
      return
    }

    try {
      setVotingId(id)
      await voteFeedback(id)
      
      // Update local state
      setFeedback((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              votes: item.hasVoted ? item.votes - 1 : item.votes + 1,
              hasVoted: !item.hasVoted,
            }
          }
          return item
        }),
      )

      toast({
        title: "Vote recorded",
        description: "Your vote has been recorded. Thank you for your input!",
      })
    } catch (err) {
      console.error("Failed to vote:", err)
      toast({
        title: "Failed to vote",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setVotingId(null)
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    if (!isAdmin) return

    try {
      setUpdatingId(id)
      await updateFeedbackStatus(id, status)
      
      // Update local state
      setFeedback((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            return { ...item, status }
          }
          return item
        }),
      )

      toast({
        title: "Status updated",
        description: `Feedback status has been updated to ${status.replace("-", " ")}.`,
      })
    } catch (err) {
      console.error("Failed to update status:", err)
      toast({
        title: "Failed to update status",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "feature":
        return <Badge className="bg-secondary">Feature</Badge>
      case "bug":
        return <Badge className="bg-destructive">Bug</Badge>
      case "improvement":
        return <Badge className="bg-accent text-accent-foreground">Improvement</Badge>
      default:
        return <Badge>General</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in-progress":
        return (
          <Badge className="bg-primary/90 hover:bg-primary">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-destructive/80">
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">Open</Badge>
    }
  }

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-secondary">Feedback & Suggestions</CardTitle>
          <CardDescription>Loading feedback data...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-secondary">Feedback & Suggestions</CardTitle>
          <CardDescription>An error occurred</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="text-center text-destructive">
            <p>{error}</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-secondary">Feedback & Suggestions</CardTitle>
            <CardDescription>Vote on feedback to help us prioritize improvements</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search feedback..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList className="flex w-full overflow-x-auto">
            <TabsTrigger value="all">All Feedback</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            {isAdmin && <TabsTrigger value="rejected">Rejected</TabsTrigger>}
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredFeedback.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No feedback found matching your criteria.</p>
              </div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {filteredFeedback.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3 md:p-4 hover:shadow-sm transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 md:gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {getCategoryBadge(item.category)}
                            {getStatusBadge(item.status)}
                          </div>
                          <div className="sm:hidden">
                            <Button
                              variant={item.hasVoted ? "default" : "outline"}
                              size="sm"
                              className={item.hasVoted ? "bg-primary" : ""}
                              onClick={() => handleVote(item.id)}
                              disabled={votingId === item.id}
                            >
                              {votingId === item.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <ThumbsUp className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                              )}
                              {item.votes}
                            </Button>
                          </div>
                        </div>
                        <h3 className="font-medium text-base md:text-lg">{item.title}</h3>
                        <p className="text-muted-foreground text-xs md:text-sm">{item.description}</p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Avatar className="h-5 w-5">
                              {item.user.image ? (
                                <AvatarImage src={item.user.image} alt={item.user.name || ""} />
                              ) : null}
                              <AvatarFallback className="text-[10px]">
                                {item.user.name?.substring(0, 2).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span>{item.user.name || "Anonymous"}</span>
                          </div>
                          <span>{format(new Date(item.createdAt), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                      <div className="hidden sm:flex sm:flex-col sm:items-end gap-2">
                        <Button
                          variant={item.hasVoted ? "default" : "outline"}
                          size="sm"
                          className={item.hasVoted ? "bg-primary" : ""}
                          onClick={() => handleVote(item.id)}
                          disabled={votingId === item.id}
                        >
                          {votingId === item.id ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-2" />
                          ) : (
                            <ThumbsUp className="h-4 w-4 mr-2" />
                          )}
                          {item.votes}
                        </Button>

                        {isAdmin && item.status !== "completed" && item.status !== "rejected" && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.status !== "in-progress" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateStatus(item.id, "in-progress")}
                                disabled={updatingId === item.id}
                                className="text-xs"
                              >
                                {updatingId === item.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : null}
                                Mark In Progress
                              </Button>
                            )}
                            {item.status !== "completed" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateStatus(item.id, "completed")}
                                disabled={updatingId === item.id}
                                className="text-xs"
                              >
                                {updatingId === item.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : null}
                                Mark Complete
                              </Button>
                            )}
                            {item.status !== "rejected" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateStatus(item.id, "rejected")}
                                disabled={updatingId === item.id}
                                className="text-xs text-destructive hover:text-destructive"
                              >
                                {updatingId === item.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : null}
                                Reject
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

