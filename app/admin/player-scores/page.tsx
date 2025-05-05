"use client"

import { redirect } from "next/navigation"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SearchIcon, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getCompetitions } from "@/app/actions/competitions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSession } from "next-auth/react"

interface PlayerScore {
  id: string;
  user: any;
  team: any;
  selfScore: number | null;
  peerScore: number | null;
  finalScore: number;
}

export default function AdminPlayerScoresPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  
  // Client-side state
  const [scores, setScores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [competitions, setCompetitions] = useState<any[]>([])
  const [selectedCompetition, setSelectedCompetition] = useState<string>("")

  // Check authentication
  useEffect(() => {
    if (status === "loading") return
    
    if (!session?.user) {
      router.push("/login?callbackUrl=/admin/player-scores")
      return
    }
    
    if (session.user.role !== "admin") {
      router.push("/404")
      return
    }
    
    loadCompetitions()
  }, [session, status, router])

  const loadCompetitions = async () => {
    try {
      const comps = await getCompetitions()
      setCompetitions(comps)
      
      // Set active competition as default
      const activeComp = comps.find(c => c.status === "active")
      if (activeComp) {
        setSelectedCompetition(activeComp.id)
        loadPlayerScores(activeComp.id)
      } else if (comps.length > 0) {
        setSelectedCompetition(comps[0].id)
        loadPlayerScores(comps[0].id)
      }
    } catch (error) {
      console.error("Error loading competitions:", error)
    }
  }

  const loadPlayerScores = async (competitionId: string) => {
    if (!competitionId) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/player-scores?competitionId=${competitionId}`)
      if (!response.ok) throw new Error("Failed to fetch player scores")
      
      const data = await response.json()
      setScores(data.scores)
    } catch (error) {
      console.error("Error loading player scores:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCompetitionChange = (value: string) => {
    setSelectedCompetition(value)
    loadPlayerScores(value)
  }

  // Process the data to calculate final scores
  const playerScores: PlayerScore[] = scores.map(user => {
    // Get all self scores for this user
    const selfScores = scores.filter((score: any) => 
      score.userId === user.id && score.type === 'self'
    )
    
    // Calculate average self score
    let selfScoreAvg = 0
    if (selfScores.length > 0) {
      const selfScoreSum = selfScores.reduce((sum: number, score: any) => {
        const scoreValues = Object.values(score.scores as Record<string, number>)
        return sum + scoreValues.reduce((s: number, v: number) => s + v, 0) / scoreValues.length
      }, 0)
      selfScoreAvg = selfScoreSum / selfScores.length
    }
    
    // Get all peer scores for this user
    const peerScores = scores.filter((score: any) => 
      score.ratedId === user.id && score.type === 'peer'
    )
    
    // Calculate average peer score
    let peerScoreAvg = 0
    if (peerScores.length > 0) {
      const peerScoreSum = peerScores.reduce((sum: number, score: any) => {
        const scoreValues = Object.values(score.scores as Record<string, number>)
        return sum + scoreValues.reduce((s: number, v: number) => s + v, 0) / scoreValues.length
      }, 0)
      peerScoreAvg = peerScoreSum / peerScores.length
    }
    
    // Calculate final score - weight self-assessment at 40% and peer ratings at 60%
    let finalScore = 0
    
    if (selfScores.length > 0 || peerScores.length > 0) {
      if (selfScores.length > 0 && peerScores.length > 0) {
        // Both self and peer scores available
        finalScore = Math.round(selfScoreAvg * 0.4 + peerScoreAvg * 0.6)
      } else if (selfScores.length > 0) {
        // Only self-assessment available
        finalScore = Math.round(selfScoreAvg)
      } else if (peerScores.length > 0) {
        // Only peer ratings available
        finalScore = Math.round(peerScoreAvg)
      }
      
      // Convert from 1-5 scale to 0-100 scale
      finalScore = Math.round((finalScore / 5) * 100)
    }
    
    return {
      id: user.id,
      user,
      team: user.team,
      selfScore: selfScores.length > 0 ? selfScoreAvg : null,
      peerScore: peerScores.length > 0 ? peerScoreAvg : null,
      finalScore,
    }
  })

  // If loading auth or redirecting, show loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4 md:py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 md:mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Player Scores</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            View and analyze player self-assessment and peer review scores
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <h2 className="text-lg md:text-xl font-semibold">
          {selectedCompetition ? competitions.find(c => c.id === selectedCompetition)?.name || "No Competition Selected" : "No Competition Selected"}
        </h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search players..."
            className="w-full sm:w-64"
            type="search"
          />
          <div className="w-full sm:w-[200px]">
            <Select
              value={selectedCompetition}
              onValueChange={handleCompetitionChange}
              disabled={competitions.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Competition" />
              </SelectTrigger>
              <SelectContent>
                {competitions.map((competition) => (
                  <SelectItem key={competition.id} value={competition.id}>
                    {competition.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle>Player Score Summary</CardTitle>
          <CardDescription>
            Only admins can see these final player scores. Individual players see only their own self-assessment scores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Self Score</TableHead>
                  <TableHead>Peer Score</TableHead>
                  <TableHead>Final Score</TableHead>
                  <TableHead>Team</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {playerScores.map((score) => (
                  <TableRow key={score.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={score.user.image} alt={score.user.name} />
                          <AvatarFallback>{score.user.name?.substring(0, 2) || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{score.user.name}</div>
                          <div className="text-sm text-muted-foreground">{score.user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{score.selfScore ? score.selfScore.toFixed(1) : "N/A"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{score.peerScore ? score.peerScore.toFixed(1) : "N/A"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-full border-4 border-primary flex items-center justify-center">
                          <span className="text-xs font-medium">{score.finalScore || "N/A"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {score.team ? (
                          <Badge variant="outline">{score.team.name}</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Unassigned
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>
              Distribution of player scores across score ranges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { range: "90-100", count: playerScores.filter(p => p.finalScore >= 90).length },
                { range: "80-89", count: playerScores.filter(p => p.finalScore >= 80 && p.finalScore < 90).length },
                { range: "70-79", count: playerScores.filter(p => p.finalScore >= 70 && p.finalScore < 80).length },
                { range: "60-69", count: playerScores.filter(p => p.finalScore >= 60 && p.finalScore < 70).length },
                { range: "Below 60", count: playerScores.filter(p => p.finalScore < 60).length },
              ].map((item) => (
                <div key={item.range} className="flex items-center justify-between">
                  <div className="font-medium">{item.range}</div>
                  <div className="flex items-center gap-2">
                    <div className="w-40 h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ 
                          width: `${playerScores.length ? (item.count / playerScores.length) * 100 : 0}%` 
                        }} 
                      />
                    </div>
                    <div className="w-8 text-right">{item.count}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Self vs Peer Scores</CardTitle>
            <CardDescription>
              Compare self-assessment with peer ratings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { 
                  label: "Self > Peer", 
                  count: playerScores.filter(p => p.selfScore && p.peerScore && p.selfScore > p.peerScore).length,
                  description: "Players who rated themselves higher than peers rated them" 
                },
                { 
                  label: "Self = Peer", 
                  count: playerScores.filter(p => p.selfScore && p.peerScore && Math.abs(p.selfScore - p.peerScore) < 0.5).length,
                  description: "Players whose self-ratings closely match peer ratings" 
                },
                { 
                  label: "Self < Peer", 
                  count: playerScores.filter(p => p.selfScore && p.peerScore && p.selfScore < p.peerScore).length,
                  description: "Players who rated themselves lower than peers rated them" 
                },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{item.label}</div>
                    <Badge variant="outline">{item.count}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                  <Separator className="mt-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Score Averages</CardTitle>
            <CardDescription>
              Average player scores by team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from(
                new Set(playerScores.filter(p => p.team).map(p => p.team.id))
              ).map(teamId => {
                const teamPlayers = playerScores.filter(p => p.team && p.team.id === teamId)
                const teamName = teamPlayers[0]?.team.name || "Unknown Team"
                const avgScore = teamPlayers.reduce((sum, p) => sum + p.finalScore, 0) / teamPlayers.length
                
                return (
                  <div key={teamId} className="flex items-center justify-between">
                    <div className="font-medium">{teamName}</div>
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-full border-4 border-primary flex items-center justify-center">
                        <span className="text-xs font-medium">{avgScore.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 