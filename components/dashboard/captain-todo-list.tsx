"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

export function CaptainTodoList() {
  const [todos, setTodos] = useState<
    {
      id: string
      title: string
      description: string
      dueDate: string
      priority: "high" | "medium" | "low"
      type: "review" | "assignment" | "accolade"
      status: "pending" | "completed"
      link: string
    }[]
  >([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, fetch from API
    // For now, use mock data
    const mockTodos = [
      {
        id: "todo1",
        title: "Review Players for Basketball Game",
        description: "Provide feedback and accolades for players in the recent basketball game",
        dueDate: "2025-06-18",
        priority: "high" as const,
        type: "review" as const,
        status: "pending" as const,
        link: "/games/game1/review",
      },
      {
        id: "todo2",
        title: "Assign Players for Soccer Match",
        description: "Select players for the upcoming soccer match against Royal Rams",
        dueDate: "2025-06-15",
        priority: "high" as const,
        type: "assignment" as const,
        status: "pending" as const,
        link: "/games/game2",
      },
      {
        id: "todo3",
        title: "Assign Accolades for Volleyball Tournament",
        description: "Recognize outstanding players from the volleyball tournament",
        dueDate: "2025-06-12",
        priority: "medium" as const,
        type: "accolade" as const,
        status: "completed" as const,
        link: "/games/game3/review",
      },
    ]

    setTodos(mockTodos)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Captain To-Do List</CardTitle>
          <CardDescription>Loading your tasks...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-md"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const pendingTodos = todos.filter((todo) => todo.status === "pending")

  if (pendingTodos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Captain To-Do List</CardTitle>
          <CardDescription>Tasks that require your attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-medium mb-1">All caught up!</h3>
            <p className="text-muted-foreground mb-4">You have no pending tasks at the moment.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Captain To-Do List</CardTitle>
        <CardDescription>Tasks that require your attention</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingTodos.map((todo) => (
            <div key={todo.id} className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="flex-shrink-0">
                {todo.priority === "high" ? (
                  <AlertCircle className="h-6 w-6 text-red-500" />
                ) : (
                  <Clock className="h-6 w-6 text-amber-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium">{todo.title}</h3>
                  <Badge variant={todo.priority === "high" ? "destructive" : "outline"} className="text-xs">
                    {todo.priority === "high" ? "Urgent" : "Due Soon"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{todo.description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Due:{" "}
                    {new Date(todo.dueDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <Button size="sm" asChild>
                    <Link href={todo.link}>
                      {todo.type === "review"
                        ? "Review Players"
                        : todo.type === "assignment"
                          ? "Assign Players"
                          : "Assign Accolades"}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

