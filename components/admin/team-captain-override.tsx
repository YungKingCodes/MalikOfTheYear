"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Save, Crown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getTeamsForCaptainOverride, updateTeamCaptain } from "@/app/actions/teams"

interface TeamMember {
  id: string
  name: string | null
  email: string
  image: string | null
  role?: string
}

interface Team {
  id: string
  name: string
  score: number
  maxScore: number
  captain: TeamMember | null
  members: TeamMember[]
}

export function TeamCaptainOverride() {
  const { toast } = useToast()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveTeamId, setSaveTeamId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true)
      try {
        const teamsData = await getTeamsForCaptainOverride();
        
        if (Array.isArray(teamsData)) {
          const mappedTeams: Team[] = teamsData.map(team => ({
            id: team.id,
            name: team.name,
            score: team.score,
            maxScore: team.maxScore,
            captain: team.captain ? {
              id: team.captain.id,
              name: team.captain.name,
              email: team.captain.email || '',
              image: team.captain.image,
              role: 'captain'
            } : null,
            members: team.members.map(member => ({
              id: member.id,
              name: member.name,
              email: member.email || '',
              image: member.image,
              role: member.role || 'player'
            }))
          }));
          
          setTeams(mappedTeams);
        } else {
          throw new Error("Invalid teams data format");
        }
      } catch (error) {
        console.error("Failed to fetch teams:", error)
        toast({
          title: "Error",
          description: "Failed to load teams. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTeams()
  }, [toast])

  const handleChangeCaptain = (teamId: string, newCaptainId: string) => {
    setTeams((prev) =>
      prev.map((team) => {
        if (team.id === teamId) {
          const newCaptain = team.members.find((member) => member.id === newCaptainId) || null

          return {
            ...team,
            captain: newCaptain,
          }
        }
        return team
      }),
    )
  }

  const handleSave = async (teamId: string) => {
    setSaving(true)
    setSaveTeamId(teamId)
    
    try {
      const team = teams.find(t => t.id === teamId);
      if (!team || !team.captain) {
        throw new Error("Team or captain not found");
      }
      
      await updateTeamCaptain(teamId, team.captain.id);

      toast({
        title: "Team Updated",
        description: `Captain for ${team.name} has been updated successfully.`,
      })
    } catch (error) {
      console.error("Failed to save team captain:", error)
      toast({
        title: "Error",
        description: "Failed to update team captain. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
      setSaveTeamId(null)
    }
  }

  const openTeamDialog = (team: Team) => {
    setSelectedTeam(team)
    setDialogOpen(true)
  }

  // Filter teams based on search query
  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search teams..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-muted-foreground">Loading teams...</div>
          </div>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="flex items-center justify-center p-8 border rounded-lg">
          <div className="text-center">
            <h3 className="mb-2 text-lg font-medium">No Teams Found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map((team) => (
            <Card key={team.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center justify-between">
                  <span>{team.name}</span>
                  <Badge variant="outline">{team.members.length} members</Badge>
                </CardTitle>
                <CardDescription>Current captain: {team.captain?.name || "None"}</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <Select
                    value={team.captain?.id || ""}
                    onValueChange={(value) => handleChangeCaptain(team.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a captain" />
                    </SelectTrigger>
                    <SelectContent>
                      {team.members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={member.image || `/placeholder.svg?height=24&width=24&text=${member.name?.substring(0, 2) || "??"}`}
                                alt={member.name || "Unknown"}
                              />
                              <AvatarFallback>{member.name ? member.name.substring(0, 2).toUpperCase() : "??"}</AvatarFallback>
                            </Avatar>
                            <span>{member.name || "Unknown"}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => openTeamDialog(team)}
                    >
                      View Team
                    </Button>
                    <Button
                      className="w-full"
                      onClick={() => handleSave(team.id)}
                      disabled={saving && saveTeamId === team.id}
                    >
                      {saving && saveTeamId === team.id ? (
                        "Saving..."
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" /> Save
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedTeam && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedTeam.name}</DialogTitle>
              <DialogDescription>Team Members</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {selectedTeam.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={member.image || `/placeholder.svg?height=40&width=40&text=${member.name?.substring(0, 2) || "??"}`}
                        alt={member.name || "Unknown"}
                      />
                      <AvatarFallback>{member.name ? member.name.substring(0, 2).toUpperCase() : "??"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.name || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  {selectedTeam.captain?.id === member.id && (
                    <Badge className="bg-primary">
                      <Crown className="h-3 w-3 mr-1" /> Captain
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

