"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { ChevronLeft, RefreshCw, Check, Loader2 } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { getCompetitions } from "@/app/actions/competitions"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

export default function SwapPlayersPage() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTeamId = searchParams.get('teamId')
  
  const [competitions, setCompetitions] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>('')
  const [sourceTeamId, setSourceTeamId] = useState<string>(initialTeamId || '')
  const [targetTeamId, setTargetTeamId] = useState<string>('')
  const [sourceTeam, setSourceTeam] = useState<any>(null)
  const [targetTeam, setTargetTeam] = useState<any>(null)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSwapping, setIsSwapping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availablePlayers, setAvailablePlayers] = useState<any[]>([])
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [playerScores, setPlayerScores] = useState<Record<string, number>>({})
  const [teamData, setTeamData] = useState<Record<string, any>>({})

  // Load available competitions
  useEffect(() => {
    async function loadCompetitions() {
      try {
        const comps = await getCompetitions()
        setCompetitions(comps)
        
        // Set active competition as default if it exists
        const activeComp = comps.find((c: any) => c.status === 'active')
        if (activeComp) {
          setSelectedCompetitionId(activeComp.id)
        } else if (comps.length > 0) {
          setSelectedCompetitionId(comps[0].id)
        }
      } catch (err) {
        console.error('Error loading competitions:', err)
        setError('Failed to load competitions')
      }
    }
    
    loadCompetitions()
  }, [])
  
  // Load teams when competition is selected
  useEffect(() => {
    async function loadTeams() {
      if (!selectedCompetitionId) return
      
      try {
        setIsLoading(true)
        const response = await fetch(`/api/teams?competitionId=${selectedCompetitionId}&includeScores=true`, {
          credentials: "include"
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch teams')
        }
        
        const data = await response.json()
        setTeams(data.teams || [])
        
        // If we have an initial team ID and it belongs to this competition, select it
        if (initialTeamId) {
          const initialTeamExists = data.teams.some((t: any) => t.id === initialTeamId)
          if (initialTeamExists) {
            setSourceTeamId(initialTeamId)
          } else {
            setSourceTeamId('')
          }
        }
        
        // Extract player scores into a map for easy access
        const scoreMap: Record<string, number> = {}
        
        // Process each team's members
        data.teams.forEach((team: any) => {
          if (team.memberIds) {
            team.memberIds.forEach((memberId: string, index: number) => {
              if (team.memberScores && team.memberScores[index]) {
                scoreMap[memberId] = team.memberScores[index]
              }
            })
          }
        })
        
        setPlayerScores(scoreMap)
        
        setError(null)
      } catch (err) {
        console.error('Error loading teams:', err)
        setError('Failed to load teams')
        setTeams([])
      } finally {
        setIsLoading(false)
      }
    }
    
    loadTeams()
  }, [selectedCompetitionId, initialTeamId])
  
  // Load source team data
  useEffect(() => {
    async function loadSourceTeam() {
      if (!sourceTeamId) {
        setSourceTeam(null)
        return
      }
      
      try {
        setIsLoading(true)
        const response = await fetch(`/api/teams/${sourceTeamId}?include=members`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch source team')
        }
        
        const team = await response.json()
        setSourceTeam(team)
        setError(null)
      } catch (err) {
        console.error('Error loading source team:', err)
        setError('Failed to load source team')
        setSourceTeam(null)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadSourceTeam()
  }, [sourceTeamId])
  
  // Load target team data
  useEffect(() => {
    async function loadTargetTeam() {
      if (!targetTeamId) {
        setTargetTeam(null)
        return
      }
      
      try {
        setIsLoading(true)
        const response = await fetch(`/api/teams/${targetTeamId}?include=members`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch target team')
        }
        
        const team = await response.json()
        setTargetTeam(team)
        setError(null)
      } catch (err) {
        console.error('Error loading target team:', err)
        setError('Failed to load target team')
        setTargetTeam(null)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadTargetTeam()
  }, [targetTeamId])
  
  // Handle team swap
  const handleSwapPlayer = async () => {
    if (!sourceTeamId || !targetTeamId || !selectedPlayerId) {
      toast({
        title: "Missing information",
        description: "Please select source team, target team, and a player to swap.",
        variant: "destructive"
      })
      return
    }
    
    try {
      setIsSwapping(true)
      
      const response = await fetch('/api/teams/swap-player', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sourceTeamId,
          targetTeamId,
          playerId: selectedPlayerId
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to swap player')
      }
      
      toast({
        title: "Player swapped",
        description: "Player has been moved to the new team successfully.",
        variant: "default"
      })
      
      // Refresh team data
      const sourceResponse = await fetch(`/api/teams/${sourceTeamId}?include=members`)
      const targetResponse = await fetch(`/api/teams/${targetTeamId}?include=members`)
      
      setSourceTeam(await sourceResponse.json())
      setTargetTeam(await targetResponse.json())
      setSelectedPlayerId('')
    } catch (err) {
      console.error('Error swapping player:', err)
      toast({
        title: "Swap failed",
        description: err instanceof Error ? err.message : "Failed to swap player between teams.",
        variant: "destructive"
      })
    } finally {
      setIsSwapping(false)
    }
  }
  
  // Get user initials for avatar
  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }
  
  // Load team players
  const loadTeamPlayers = async (teamId: string) => {
    if (!teamId) return
    
    try {
      const response = await fetch(`/api/teams/${teamId}/members`, {
        credentials: "include"
      })
      
      if (!response.ok) {
        throw new Error("Failed to fetch team members")
      }
      
      const data = await response.json()
      
      // Add player scores to the player objects if available
      const playersWithScores = data.members.map((player: any) => ({
        ...player,
        score: playerScores[player.id] || 0
      }))
      
      setAvailablePlayers(playersWithScores)
      setSelectedPlayers([])
    } catch (error) {
      console.error("Error loading team players:", error)
      toast({
        title: "Error loading players",
        description: "Could not load team members. Please try again.",
        variant: "destructive"
      })
    }
  }
  
  // Add function to calculate team score after swap
  const calculateTeamScoreAfterSwap = (teamId: string, addPlayerIds: string[] = [], removePlayerIds: string[] = []) => {
    const team = teamData[teamId]
    if (!team) return { average: 0, totalScore: 0, playerCount: 0 }
    
    // Get current members excluding ones to be removed
    const currentMembers = team.memberIds.filter(
      (id: string) => !removePlayerIds.includes(id)
    )
    
    // Calculate current total score
    let totalScore = currentMembers.reduce((sum: number, id: string) => {
      return sum + (playerScores[id] || 50)
    }, 0)
    
    // Add scores of new players
    addPlayerIds.forEach(id => {
      totalScore += (playerScores[id] || 50)
    })
    
    const finalMemberCount = currentMembers.length + addPlayerIds.length
    const average = finalMemberCount > 0 ? Math.round(totalScore / finalMemberCount) : 0
    
    return {
      average,
      totalScore,
      playerCount: finalMemberCount
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link href="/admin/teams">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Teams
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Swap Players</h1>
          <p className="text-muted-foreground">
            Move players between teams to adjust team balance
          </p>
        </div>
      </div>
      
      <Separator />
      
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-12">
          <CardHeader>
            <CardTitle>Select Teams</CardTitle>
            <CardDescription>
              Choose a competition and the source/target teams for player swapping
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="competition">Competition</Label>
                <Select
                  value={selectedCompetitionId}
                  onValueChange={setSelectedCompetitionId}
                  disabled={isLoading}
                >
                  <SelectTrigger id="competition">
                    <SelectValue placeholder="Select competition" />
                  </SelectTrigger>
                  <SelectContent>
                    {competitions.map((competition) => (
                      <SelectItem key={competition.id} value={competition.id}>
                        {competition.name} ({competition.year})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="source-team">Source Team</Label>
                <Select
                  value={sourceTeamId}
                  onValueChange={setSourceTeamId}
                  disabled={isLoading || teams.length === 0}
                >
                  <SelectTrigger id="source-team">
                    <SelectValue placeholder="Select source team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="target-team">Target Team</Label>
                <Select
                  value={targetTeamId}
                  onValueChange={setTargetTeamId}
                  disabled={isLoading || teams.length === 0 || !sourceTeamId}
                >
                  <SelectTrigger id="target-team">
                    <SelectValue placeholder="Select target team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams
                      .filter(team => team.id !== sourceTeamId)
                      .map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-6">
          <CardHeader>
            <CardTitle>Source Team: {sourceTeam?.name || "Not Selected"}</CardTitle>
            <CardDescription>
              Select a player to move to the target team
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !sourceTeam ? (
              <div className="text-center py-8 text-muted-foreground">
                Please select a source team
              </div>
            ) : sourceTeam.members.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No members in this team
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground mb-2">
                  {sourceTeam.members.length} members in team
                </div>
                {sourceTeam.members.map((member: any) => (
                  <div
                    key={member.id}
                    className={`
                      flex items-center justify-between p-3 rounded-md border
                      ${selectedPlayerId === member.id ? 'bg-primary/5 border-primary' : ''}
                      hover:bg-muted/50 cursor-pointer
                    `}
                    onClick={() => setSelectedPlayerId(member.id)}
                  >
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={member.image || ""} alt={member.name} />
                        <AvatarFallback>{getUserInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div>
                      {sourceTeam.captainId === member.id ? (
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">
                          Captain
                        </Badge>
                      ) : (
                        selectedPlayerId === member.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="md:col-span-6">
          <CardHeader>
            <CardTitle>Target Team: {targetTeam?.name || "Not Selected"}</CardTitle>
            <CardDescription>
              Team that will receive the selected player
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : !targetTeam ? (
              <div className="text-center py-8 text-muted-foreground">
                Please select a target team
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground mb-2">
                  {targetTeam.members.length} members in team
                </div>
                <div className="space-y-2">
                  {targetTeam.members.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={member.image || ""} alt={member.name} />
                          <AvatarFallback>{getUserInitials(member.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      {targetTeam.captainId === member.id && (
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">
                          Captain
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end">
        <Button
          onClick={handleSwapPlayer}
          disabled={isSwapping || isLoading || !sourceTeamId || !targetTeamId || !selectedPlayerId}
        >
          {isSwapping ? "Moving Player..." : "Swap Player"}
        </Button>
      </div>
    </div>
  )
} 