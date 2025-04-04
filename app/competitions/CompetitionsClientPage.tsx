"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Trophy, Users, Crown, Plus } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

// Define competition type
interface Competition {
  id: string
  name: string
  description: string
  year: number
  startDate: string
  endDate: string
  status: string
  theme: string
  teams?: number
  winnerTeam?: string
  goat?: string
  prize?: string
}

export default function CompetitionsClientPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const response = await fetch('/api/competitions')
        if (!response.ok) {
          throw new Error('Failed to fetch competitions')
        }
        const data = await response.json()
        setCompetitions(data)
      } catch (err) {
        console.error('Error fetching competitions:', err)
        setError('Failed to load competitions. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchCompetitions()
  }, [])

  if (loading) {
    return <div className="flex justify-center p-8">Loading competitions...</div>
  }

  if (error) {
    return <div className="text-red-500 p-8">{error}</div>
  }

  const activeCompetitions = competitions.filter(comp => comp.status === 'active')
  const completedCompetitions = competitions.filter(comp => comp.status === 'completed')
  
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Competitions</h1>
          <p className="text-muted-foreground">View and manage annual Malik of The Year competitions</p>
        </div>
        <AdminOnlyButton />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {activeCompetitions.length > 0 && activeCompetitions.map(competition => (
          <Card key={competition.id} className="overflow-hidden">
            <div className="relative h-48">
              <Badge className="absolute top-4 right-4 z-10">Active</Badge>
              <Image
                src="/placeholder.svg?height=192&width=384"
                alt={competition.name}
                fill
                className="object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>{competition.name}</CardTitle>
              <CardDescription>{competition.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(competition.startDate).toLocaleDateString()} - {new Date(competition.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Top Prize: {competition.prize || "TBD"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{competition.teams || 0} Teams</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/competitions/${competition.year}`}>View Competition</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}

        {completedCompetitions.slice(0, 2).map(competition => (
          <Card key={competition.id} className="overflow-hidden">
            <div className="relative h-48">
              <Badge className="absolute top-4 right-4 z-10" variant="secondary">
                Completed
              </Badge>
              <Image src="/placeholder.svg?height=192&width=384" alt={competition.name} fill className="object-cover" />
            </div>
            <CardHeader>
              <CardTitle>{competition.name}</CardTitle>
              <CardDescription>{competition.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(competition.startDate).toLocaleDateString()} - {new Date(competition.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Winner: {competition.winnerTeam || "TBD"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">GOAT: {competition.goat || "TBD"}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/competitions/${competition.year}`}>View Archive</Link>
              </Button>
            </CardFooter>
          </Card>
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
                {competitions.sort((a, b) => b.year - a.year).map((competition) => (
                  <div key={competition.id} className="grid grid-cols-5 p-4">
                    <div className="font-medium">{competition.year}</div>
                    <div>{competition.theme}</div>
                    <div>{competition.teams || 0}</div>
                    <div>{competition.status === 'active' ? 'In Progress' : (competition.winnerTeam || 'TBD')}</div>
                    <div>{competition.status === 'active' ? 'TBD' : (competition.goat || 'TBD')}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Client component for admin-only button
function AdminOnlyButton() {
  const { data: session } = useSession()
  const user = session?.user

  if (user?.role !== "admin") return null

  return (
    <div className="flex items-center gap-2">
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Create Competition
      </Button>
    </div>
  )
}

