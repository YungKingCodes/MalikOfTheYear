"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, Trophy, Users, Crown } from "lucide-react"
import { useSession } from "next-auth/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { getCompetitions, getCompetitionRegisteredUsersCount } from "@/app/actions/competitions"
import { getUserCompetitionRegistrations } from "@/app/actions/competitions"

interface Team {
  id: string
  name: string
}

interface Competition {
  id: string
  name: string
  year: number
  startDate: string
  endDate: string
  status: string
  description: string
  teams: Team[]
  teamIds: string[]
  gameIds: string[]
  winnerId?: string | null
  goatId?: string | null
  playerCount?: number
}

export function CompetitionsTab() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()
  const user = session?.user
  const isAdmin = user?.role === "admin"

  useEffect(() => {
    async function loadCompetitions() {
      try {
        setLoading(true)
        const competitionsData = await getCompetitions()
        // Fetch player counts for each competition
        const competitionsWithPlayerCounts = await Promise.all(
          competitionsData.map(async (comp) => {
            const playerCount = await getCompetitionRegisteredUsersCount(comp.id)
            return {
              ...comp,
              playerCount
            }
          })
        )
        setCompetitions(competitionsWithPlayerCounts)
      } catch (err) {
        console.error("Failed to load competitions:", err)
        setError("Failed to load competitions. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadCompetitions()
  }, [])

  if (loading) {
    return <CompetitionsTabSkeleton />
  }

  if (error) {
    return <div className="py-4 text-center text-destructive">{error}</div>
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Competitions</h2>
          <p className="text-muted-foreground">Manage annual Malik of The Year competitions</p>
        </div>
        <div className="flex items-center gap-2">{isAdmin && <CreateCompetitionDialog />}</div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {competitions.map((competition) => (
          <CompetitionCard key={competition.id} competition={competition} isAdmin={isAdmin} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Competition History</CardTitle>
          <CardDescription>Complete history of all Malik of The Year competitions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div className="rounded-md border">
              <div className="grid grid-cols-5 p-4 font-medium">
                <div>Year</div>
                <div>Theme</div>
                <div>Teams</div>
                <div>Winner</div>
                <div>GOAT</div>
              </div>
              <div className="divide-y">
                {competitions
                  .sort((a, b) => b.year - a.year)
                  .map((competition) => (
                    <div key={competition.id} className="grid grid-cols-5 p-4">
                      <div className="font-medium">{competition.year}</div>
                      <div>{competition.name}</div>
                      <div>{competition.teams?.length || 0}</div>
                      <div>
                        {competition.status === "active"
                          ? "In Progress"
                          : competition.winnerId
                            ? competition.teams?.find(t => t.id === competition.winnerId)?.name || "Winner Team"
                            : "TBD"}
                      </div>
                      <div>
                        {competition.status === "active"
                          ? "TBD"
                          : competition.goatId
                            ? "GOAT Player"
                            : "TBD"}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

function CompetitionCard({ competition, isAdmin }: { competition: Competition; isAdmin: boolean }) {
  const startDate = new Date(competition.startDate)
  const endDate = new Date(competition.endDate)

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48">
        <Badge
          className="absolute top-4 right-4 z-10"
          variant={competition.status === "active" ? "default" : "secondary"}
        >
          {competition.status === "active" ? "Active" : "Completed"}
        </Badge>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 flex items-center justify-center">
          <h3 className="text-2xl font-bold">{competition.name}</h3>
        </div>
      </div>
      <CardHeader>
        <CardTitle>
          {competition.name} {competition.year}
        </CardTitle>
        <CardDescription>{competition.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {startDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })} -{" "}
              {endDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
          </div>
          {competition.status === "active" ? (
            <>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Top Prize: "The GOAT" Trophy</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {competition.teams?.length || 0} Teams, {competition.playerCount || 0} Players
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Winner:{" "}
                  {competition.winnerId
                    ? competition.teams?.find(t => t.id === competition.winnerId)?.name || "Winner Team"
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  GOAT:{" "}
                  {competition.goatId
                    ? "GOAT Player"
                    : "N/A"}
                </span>
              </div>
            </>
          )}
        </div>
      </CardContent>
      <div className="p-6 pt-0 flex gap-2">
        <Button asChild variant="outline" className="flex-1">
          <a href={`/competitions/${competition.id}`}>View</a>
        </Button>
        {isAdmin && (
          <Button variant="ghost" className="flex-1">
            Edit
          </Button>
        )}
      </div>
    </Card>
  )
}

function CreateCompetitionDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [year, setYear] = useState(new Date().getFullYear() + 1)
  const [description, setDescription] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real implementation, this would call an API endpoint
    alert(`Competition "${name} ${year}" would be created`)
    setName("")
    setYear(new Date().getFullYear() + 1)
    setDescription("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Competition
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Competition</DialogTitle>
            <DialogDescription>Add a new annual competition.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="comp-name" className="text-right">
                Theme Name
              </Label>
              <Input
                id="comp-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="comp-year" className="text-right">
                Year
              </Label>
              <Input
                id="comp-year"
                type="number"
                value={year}
                onChange={(e) => setYear(Number.parseInt(e.target.value))}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="comp-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="comp-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                rows={3}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create Competition</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function CompetitionsTabSkeleton() {
  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardHeader>
              <Skeleton className="h-6 w-full max-w-[180px]" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
            <div className="p-6 pt-0">
              <Skeleton className="h-10 w-full" />
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-80" />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-5 p-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-5 w-16" />
              ))}
            </div>
            <div className="divide-y">
              {[1, 2, 3].map((i) => (
                <div key={i} className="grid grid-cols-5 p-4">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <Skeleton key={j} className="h-4 w-16" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

