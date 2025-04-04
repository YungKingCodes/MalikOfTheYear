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

interface Team {
  id: string
  name: string
  members: TeamMember[]
  captain: TeamMember | null
}

interface TeamMember {
  id: string
  name: string
  avatar: string
  isCaptain: boolean
}

export function TeamCaptainOverride() {
  const { toast } = useToast()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true)
      try {
        // In a real app, fetch from API
        // For now, use mock data
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Mock teams data
        const mockTeams: Team[] = [
          {
            id: "team1",
            name: "Mountain Goats",
            captain: {
              id: "user1",
              name: "Sarah Johnson",
              avatar: "SJ",
              isCaptain: true,
            },
            members: [
              {
                id: "user1",
                name: "Sarah Johnson",
                avatar: "SJ",
                isCaptain: true,
              },
              {
                id: "user2",
                name: "Michael Chen",
                avatar: "MC",
                isCaptain: false,
              },
              {
                id: "user3",
                name: "Emily Rodriguez",
                avatar: "ER",
                isCaptain: false,
              },
            ],
          },
          {
            id: "team2",
            name: "Royal Rams",
            captain: {
              id: "user4",
              name: "James Wilson",
              avatar: "JW",
              isCaptain: true,
            },
            members: [
              {
                id: "user4",
                name: "James Wilson",
                avatar: "JW",
                isCaptain: true,
              },
              {
                id: "user5",
                name: "Lisa Thompson",
                avatar: "LT",
                isCaptain: false,
              },
              {
                id: "user6",
                name: "David Kim",
                avatar: "DK",
                isCaptain: false,
              },
            ],
          },
          {
            id: "team3",
            name: "Athletic Antelopes",
            captain: {
              id: "user7",
              name: "Robert Brown",
              avatar: "RB",
              isCaptain: true,
            },
            members: [
              {
                id: "user7",
                name: "Robert Brown",
                avatar: "RB",
                isCaptain: true,
              },
              {
                id: "user8",
                name: "Jennifer Lee",
                avatar: "JL",
                isCaptain: false,
              },
              {
                id: "user9",
                name: "Thomas Garcia",
                avatar: "TG",
                isCaptain: false,
              },
            ],
          },
        ]

        setTeams(mockTeams)
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
            members: team.members.map((member) => ({
              ...member,
              isCaptain: member.id === newCaptainId,
            })),
          }
        }
        return team
      }),
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // In a real app, save to API
      // For now, just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Teams Updated",
        description: "Team captain changes have been saved successfully.",
      })
    } catch (error) {
      console.error("Failed to save team changes:", error)
      toast({
        title: "Error",
        description: "Failed to save team changes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const openTeamDialog = (team: Team) => {
    setSelectedTeam(team)
    setDialogOpen(true)
  }

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.captain?.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Captain Management</CardTitle>
          <CardDescription>Loading teams...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Team Captain Management</CardTitle>
          <CardDescription>Override team captains and manage team leadership</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search teams or captains..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <div className="grid grid-cols-4 p-4 font-medium">
              <div>Team</div>
              <div>Current Captain</div>
              <div>Members</div>
              <div className="text-right">Actions</div>
            </div>
            <div className="divide-y">
              {filteredTeams.map((team) => (
                <div key={team.id} className="grid grid-cols-4 p-4 items-center">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`/placeholder.svg?height=32&width=32&text=${team.name.substring(0, 2)}`}
                        alt={team.name}
                      />
                      <AvatarFallback>{team.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{team.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {team.captain ? (
                      <>
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={`/placeholder.svg?height=24&width=24&text=${team.captain.avatar}`}
                            alt={team.captain.name}
                          />
                          <AvatarFallback>{team.captain.avatar}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{team.captain.name}</span>
                      </>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                        No Captain
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm">{team.members.length} members</div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => openTeamDialog(team)}>
                      Change Captain
                    </Button>
                  </div>
                </div>
              ))}

              {filteredTeams.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">No teams found matching your search.</div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Team Captain</DialogTitle>
            <DialogDescription>
              {selectedTeam ? `Select a new captain for ${selectedTeam.name}` : "Select a new team captain"}
            </DialogDescription>
          </DialogHeader>

          {selectedTeam && (
            <>
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={`/placeholder.svg?height=40&width=40&text=${selectedTeam.name.substring(0, 2)}`}
                      alt={selectedTeam.name}
                    />
                    <AvatarFallback>{selectedTeam.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedTeam.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Current Captain: {selectedTeam.captain?.name || "None"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Select New Captain</label>
                  <Select
                    defaultValue={selectedTeam.captain?.id}
                    onValueChange={(value) => handleChangeCaptain(selectedTeam.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a team member" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedTeam.members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center gap-2">
                            {member.isCaptain && <Crown className="h-3.5 w-3.5 text-amber-500" />}
                            {member.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setDialogOpen(false)}>Confirm Change</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

