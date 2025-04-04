"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ThumbsUp, MessageSquare, Clock, CheckCircle, Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"

// Mock feedback data
const MOCK_FEEDBACK = [
  {
    id: "1",
    title: "Add dark mode support",
    description:
      "It would be great to have a dark mode option for the platform to reduce eye strain during night usage.",
    category: "feature",
    status: "in-progress",
    votes: 24,
    author: "Sarah Johnson",
    createdAt: "2025-01-15T12:00:00Z",
    comments: 5,
    userVoted: false,
  },
  {
    id: "2",
    title: "Improve mobile responsiveness",
    description: "The dashboard is difficult to use on mobile devices. Tables overflow and buttons are too small.",
    category: "ui",
    status: "pending",
    votes: 18,
    author: "Michael Chen",
    createdAt: "2025-01-20T14:30:00Z",
    comments: 3,
    userVoted: true,
  },
  {
    id: "3",
    title: "Add export to CSV option",
    description: "Would like to be able to export team and player data to CSV for offline analysis.",
    category: "feature",
    status: "completed",
    votes: 32,
    author: "Emily Rodriguez",
    createdAt: "2025-01-10T09:15:00Z",
    comments: 7,
    userVoted: false,
  },
  {
    id: "4",
    title: "Fix scoring calculation bug",
    description: "When a game ends in a tie, the scoring system doesn't properly allocate points to both teams.",
    category: "bug",
    status: "in-progress",
    votes: 41,
    author: "James Wilson",
    createdAt: "2025-01-25T16:45:00Z",
    comments: 12,
    userVoted: true,
  },
  {
    id: "5",
    title: "Add notification system",
    description: "Would be helpful to receive notifications for upcoming games, score updates, and team changes.",
    category: "feature",
    status: "pending",
    votes: 29,
    author: "David Kim",
    createdAt: "2025-01-18T11:20:00Z",
    comments: 4,
    userVoted: false,
  },
]

export function FeedbackList() {
  const [feedback, setFeedback] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const user = session?.user
  const [filteredFeedback, setFilteredFeedback] = useState(MOCK_FEEDBACK)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()
  const isAdmin = user?.role === "admin"

  useEffect(() => {
    // Filter feedback based on search query and active tab
    let filtered = MOCK_FEEDBACK

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) => item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query),
      )
    }

    // Apply tab filter
    if (activeTab !== "all") {
      filtered = filtered.filter((item) => {
        if (activeTab === "pending") return item.status === "pending"
        if (activeTab === "in-progress") return item.status === "in-progress"
        if (activeTab === "completed") return item.status === "completed"
        return true
      })
    }

    setFilteredFeedback(filtered)
  }, [searchQuery, activeTab])

  const handleVote = (id: string) => {
    setFeedback((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newVoted = !item.userVoted
          return {
            ...item,
            votes: newVoted ? item.votes + 1 : item.votes - 1,
            userVoted: newVoted,
          }
        }
        return item
      }),
    )

    toast({
      title: "Vote recorded",
      description: "Your vote has been recorded. Thank you for your input!",
    })
  }

  const updateStatus = (id: string, status: string) => {
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
  }

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "feature":
        return <Badge className="bg-secondary">Feature</Badge>
      case "bug":
        return <Badge className="bg-destructive">Bug</Badge>
      case "ui":
        return <Badge className="bg-accent text-accent-foreground">UI</Badge>
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
      default:
        return <Badge variant="outline">Pending</Badge>
    }
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
          <TabsList>
            <TabsTrigger value="all">All Feedback</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredFeedback.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No feedback found matching your criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFeedback.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {getCategoryBadge(item.category)}
                            {getStatusBadge(item.status)}
                          </div>
                          <div className="sm:hidden">
                            <Button
                              variant={item.userVoted ? "default" : "outline"}
                              size="sm"
                              className={item.userVoted ? "bg-primary" : ""}
                              onClick={() => handleVote(item.id)}
                            >
                              <ThumbsUp className="h-4 w-4 mr-2" />
                              {item.votes}
                            </Button>
                          </div>
                        </div>
                        <h3 className="font-medium text-lg">{item.title}</h3>
                        <p className="text-muted-foreground text-sm">{item.description}</p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                          <span>By {item.author}</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                          <span className="flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1" /> {item.comments} comments
                          </span>
                        </div>

                        {isAdmin && (
                          <div className="flex flex-wrap gap-2 mt-2 sm:hidden">
                            {item.status !== "in-progress" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => updateStatus(item.id, "in-progress")}
                              >
                                Mark In Progress
                              </Button>
                            )}
                            {item.status !== "completed" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => updateStatus(item.id, "completed")}
                              >
                                Mark Completed
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="hidden sm:flex flex-row sm:flex-col items-center gap-2">
                        <Button
                          variant={item.userVoted ? "default" : "outline"}
                          size="sm"
                          className={item.userVoted ? "bg-primary" : ""}
                          onClick={() => handleVote(item.id)}
                        >
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          {item.votes}
                        </Button>

                        {isAdmin && (
                          <div className="flex flex-col gap-2 mt-2">
                            {item.status !== "in-progress" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => updateStatus(item.id, "in-progress")}
                              >
                                Mark In Progress
                              </Button>
                            )}
                            {item.status !== "completed" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => updateStatus(item.id, "completed")}
                              >
                                Mark Completed
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

          <TabsContent value="pending" className="space-y-4">
            {/* Content will be filtered by the useEffect */}
            {filteredFeedback.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No pending feedback found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFeedback.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    {/* Same content as above */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {getCategoryBadge(item.category)}
                            {getStatusBadge(item.status)}
                          </div>
                          <div className="sm:hidden">
                            <Button
                              variant={item.userVoted ? "default" : "outline"}
                              size="sm"
                              className={item.userVoted ? "bg-primary" : ""}
                              onClick={() => handleVote(item.id)}
                            >
                              <ThumbsUp className="h-4 w-4 mr-2" />
                              {item.votes}
                            </Button>
                          </div>
                        </div>
                        <h3 className="font-medium text-lg">{item.title}</h3>
                        <p className="text-muted-foreground text-sm">{item.description}</p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                          <span>By {item.author}</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                          <span className="flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1" /> {item.comments} comments
                          </span>
                        </div>

                        {isAdmin && (
                          <div className="flex flex-wrap gap-2 mt-2 sm:hidden">
                            {item.status !== "in-progress" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => updateStatus(item.id, "in-progress")}
                              >
                                Mark In Progress
                              </Button>
                            )}
                            {item.status !== "completed" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => updateStatus(item.id, "completed")}
                              >
                                Mark Completed
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="hidden sm:flex flex-row sm:flex-col items-center gap-2">
                        <Button
                          variant={item.userVoted ? "default" : "outline"}
                          size="sm"
                          className={item.userVoted ? "bg-primary" : ""}
                          onClick={() => handleVote(item.id)}
                        >
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          {item.votes}
                        </Button>

                        {isAdmin && (
                          <div className="flex flex-col gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => updateStatus(item.id, "in-progress")}
                            >
                              Mark In Progress
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Similar content for other tabs */}
          <TabsContent value="in-progress" className="space-y-4">
            {/* Content will be filtered by the useEffect */}
            {filteredFeedback.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No in-progress feedback found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFeedback.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    {/* Same content structure */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {getCategoryBadge(item.category)}
                            {getStatusBadge(item.status)}
                          </div>
                          <div className="sm:hidden">
                            <Button
                              variant={item.userVoted ? "default" : "outline"}
                              size="sm"
                              className={item.userVoted ? "bg-primary" : ""}
                              onClick={() => handleVote(item.id)}
                            >
                              <ThumbsUp className="h-4 w-4 mr-2" />
                              {item.votes}
                            </Button>
                          </div>
                        </div>
                        <h3 className="font-medium text-lg">{item.title}</h3>
                        <p className="text-muted-foreground text-sm">{item.description}</p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                          <span>By {item.author}</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                          <span className="flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1" /> {item.comments} comments
                          </span>
                        </div>

                        {isAdmin && (
                          <div className="flex flex-wrap gap-2 mt-2 sm:hidden">
                            {item.status !== "in-progress" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => updateStatus(item.id, "in-progress")}
                              >
                                Mark In Progress
                              </Button>
                            )}
                            {item.status !== "completed" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => updateStatus(item.id, "completed")}
                              >
                                Mark Completed
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="hidden sm:flex flex-row sm:flex-col items-center gap-2">
                        <Button
                          variant={item.userVoted ? "default" : "outline"}
                          size="sm"
                          className={item.userVoted ? "bg-primary" : ""}
                          onClick={() => handleVote(item.id)}
                        >
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          {item.votes}
                        </Button>

                        {isAdmin && (
                          <div className="flex flex-col gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => updateStatus(item.id, "completed")}
                            >
                              Mark Completed
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {/* Content will be filtered by the useEffect */}
            {filteredFeedback.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No completed feedback found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFeedback.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    {/* Same content structure */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {getCategoryBadge(item.category)}
                            {getStatusBadge(item.status)}
                          </div>
                          <div className="sm:hidden">
                            <Button
                              variant={item.userVoted ? "default" : "outline"}
                              size="sm"
                              className={item.userVoted ? "bg-primary" : ""}
                              onClick={() => handleVote(item.id)}
                            >
                              <ThumbsUp className="h-4 w-4 mr-2" />
                              {item.votes}
                            </Button>
                          </div>
                        </div>
                        <h3 className="font-medium text-lg">{item.title}</h3>
                        <p className="text-muted-foreground text-sm">{item.description}</p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                          <span>By {item.author}</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                          <span className="flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1" /> {item.comments} comments
                          </span>
                        </div>
                      </div>
                      <div className="hidden sm:flex flex-row sm:flex-col items-center gap-2">
                        <Button
                          variant={item.userVoted ? "default" : "outline"}
                          size="sm"
                          className={item.userVoted ? "bg-primary" : ""}
                          onClick={() => handleVote(item.id)}
                        >
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          {item.votes}
                        </Button>
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

