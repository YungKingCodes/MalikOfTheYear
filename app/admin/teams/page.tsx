"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, ChevronRight, Edit, Plus, Trash, UserPlus, Users } from "lucide-react"
import { createTeam } from "@/app/actions/teams"
import { getCompetitions } from "@/app/actions/competitions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

export default function TeamsAdminPage() {
  const { toast } = useToast()
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCompetition, setActiveCompetition] = useState<any>(null)
  const [competitions, setCompetitions] = useState<any[]>([])
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>("")
  const [newTeamCompetitionId, setNewTeamCompetitionId] = useState<string>("")
  const [isCreating, setIsCreating] = useState(false)
  const [showPlayerScores, setShowPlayerScores] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        
        // Get competitions
        const competitionsData = await getCompetitions()
        if (!competitionsData || competitionsData.length === 0) {
          setLoading(false)
          return
        }
        
        setCompetitions(competitionsData)
        
        // Set active competition as default
        const active = competitionsData.find(comp => comp.status === "active") || competitionsData[0]
        setActiveCompetition(active)
        setSelectedCompetitionId(active.id)
        
        // Fetch teams for the active competition
        await loadTeamsForCompetition(active.id, showPlayerScores)
      } catch (error) {
        console.error("Failed to load teams data:", error)
        toast({
          title: "Error loading data",
          description: "Could not load teams data. Try refreshing the page.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  const loadTeamsForCompetition = async (competitionId: string, includeScores: boolean = false) => {
    if (!competitionId) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/teams?competitionId=${competitionId}&includeScores=${includeScores}`, {
        credentials: "include"
      })
      
      if (!response.ok) {
        throw new Error("Failed to fetch teams");
      }
      
      const data = await response.json()
      setTeams(data)
    } catch (error) {
      console.error("Failed to load teams:", error)
      toast({
        title: "Error loading teams",
        description: "Could not load teams for this competition.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCompetitionChange = (competitionId: string) => {
    setSelectedCompetitionId(competitionId)
    loadTeamsForCompetition(competitionId, showPlayerScores)
  }
  
  const handleTogglePlayerScores = (checked: boolean) => {
    setShowPlayerScores(checked)
    loadTeamsForCompetition(selectedCompetitionId, checked)
  }

  const handleCreateClick = () => {
    // Set default competition in create dialog to currently selected competition
    setNewTeamCompetitionId(selectedCompetitionId)
    setCreateDialogOpen(true)
  }

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      toast({
        title: "Missing team name",
        description: "Please provide a team name.",
        variant: "destructive"
      })
      return
    }
    
    if (!newTeamCompetitionId) {
      toast({
        title: "Missing competition",
        description: "Please select a competition for this team.",
        variant: "destructive"
      })
      return
    }

    setIsCreating(true)
    try {
      await createTeam(newTeamName, newTeamCompetitionId)
      
      // Refresh the teams list if the created team belongs to the currently selected competition
      if (newTeamCompetitionId === selectedCompetitionId) {
        await loadTeamsForCompetition(selectedCompetitionId, showPlayerScores)
      }
      
      setCreateDialogOpen(false)
      setNewTeamName("")
      
      toast({
        title: "Team created",
        description: `Team "${newTeamName}" has been created successfully.`
      })
    } catch (error) {
      console.error("Failed to create team:", error)
      toast({
        title: "Error creating team",
        description: error instanceof Error ? error.message : "Could not create the team. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }

  if (loading && !competitions.length) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <div className="h-10 w-32 bg-muted animate-pulse rounded-md"></div>
        </div>
        <Separator />
        <div className="h-64 bg-muted animate-pulse rounded-md"></div>
      </div>
    )
  }

  if (!competitions.length) {
    return (
      <div className="px-4 md:px-6 py-6 md:py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Competitions Available</AlertTitle>
          <AlertDescription>
            There are no competitions to manage. Please create a competition first.
          </AlertDescription>
        </Alert>
        <div className="mt-4 md:mt-6 flex justify-center">
          <Button asChild>
            <Link href="/admin/competitions/new">Create New Competition</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage teams for competitions
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select
            value={selectedCompetitionId}
            onValueChange={handleCompetitionChange}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
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
          <Button onClick={handleCreateClick}>
            <Plus className="h-4 w-4 mr-2" />
            Create Team
          </Button>
        </div>
      </div>

      <Separator className="my-4 md:my-6" />

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Team Name</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams && teams.length > 0 ? teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell className="font-medium">{team.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{team.members?.length || 0} members</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={team.status === "active" ? "default" : "secondary"}>
                    {team.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/teams/${team.id}`}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  No teams found for this competition.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={handleCreateClick}>
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>
              Add a new team to a competition.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="select-competition">Competition</Label>
              <Select 
                value={newTeamCompetitionId} 
                onValueChange={setNewTeamCompetitionId}
              >
                <SelectTrigger id="select-competition">
                  <SelectValue placeholder="Select a competition" />
                </SelectTrigger>
                <SelectContent>
                  {competitions.map((competition) => (
                    <SelectItem key={competition.id} value={competition.id}>
                      {competition.name} {competition.status === "active" && "(Active)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input 
                id="team-name" 
                placeholder="Enter team name" 
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTeam}
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Create Team"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 