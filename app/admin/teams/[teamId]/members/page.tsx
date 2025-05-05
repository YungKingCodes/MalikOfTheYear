"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { getTeamWithMembers, addTeamMember, removeTeamMember, updateTeamCaptain } from "@/app/actions/teams"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Search, UserMinus, UserPlus, Crown, Shield } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCompetitions } from "@/app/actions/competitions"
import { Checkbox } from "@/components/ui/checkbox"

export default function TeamMembersPage({ params }: { params: { teamId: string } }) {
  const { teamId } = params
  const router = useRouter()
  const { toast } = useToast()
  
  const [team, setTeam] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [processingMemberId, setProcessingMemberId] = useState<string | null>(null)
  const [searchType, setSearchType] = useState<"all" | "registered">("registered")
  const [playerScores, setPlayerScores] = useState<Record<string, any>>({})
  const [activeCompetition, setActiveCompetition] = useState<any>(null)
  const [showOnlyUnassigned, setShowOnlyUnassigned] = useState(true)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  
  // Load team data and competitions
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        
        // Load team data
        const teamData = await getTeamWithMembers(teamId)
        setTeam(teamData)
        
        // Get competitions to identify active one
        const competitionsData = await getCompetitions()
        const active = competitionsData.find(comp => comp.status === "active") || competitionsData[0]
        setActiveCompetition(active)
        
        // Load player scores if team and active competition are available
        if (teamData && active) {
          await loadPlayerScores(teamData.members, active.id)
        }
      } catch (error) {
        console.error("Error loading data:", error)
        setError("Failed to load team data. Please try again.")
        toast({
          title: "Error loading team",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [teamId, toast])
  
  // Load registered players when the dialog opens
  useEffect(() => {
    if (addMemberDialogOpen && team?.competition?.id) {
      // Auto-load all registered players when the dialog opens
      setSearchType("registered");
      setSearchQuery("");
      handleSearch();
    }
  }, [addMemberDialogOpen, team?.competition?.id]);
  
  // Function to load player scores for team members
  const loadPlayerScores = async (members: any[], competitionId: string) => {
    if (!members?.length || !competitionId) return
    
    try {
      const response = await fetch(`/api/competitions/${competitionId}/registered-players`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch player scores')
      }
      
      const data = await response.json()
      
      // Create a map of player scores by user ID
      const scoresMap: Record<string, any> = {}
      
      data.players.forEach((player: any) => {
        scoresMap[player.id] = {
          position: player.position
        }
      })
      
      setPlayerScores(scoresMap)
    } catch (error) {
      console.error('Error fetching player scores:', error)
      toast({
        title: "Error",
        description: "Failed to load player scores. Some data may be incomplete.",
        variant: "destructive"
      })
    }
  }
  
  const handleSearch = async () => {
    // Only require search query for "all" mode, not for "registered" mode
    if (searchType === "all" && !searchQuery.trim()) return
    
    try {
      setSearchLoading(true)
      setDebugInfo(null)
      
      // Check if we have the team's competition ID
      const competitionId = team.competition?.id
      
      if (searchType === "registered" && competitionId) {
        // Use the registered-players API endpoint
        let url = `/api/competitions/${competitionId}/registered-players`
        
        // Add search query if provided
        if (searchQuery.trim()) {
          url += `?q=${encodeURIComponent(searchQuery)}`
        } else {
          url += `?`
        }
        
        // Add unassignedOnly parameter if checkbox is checked
        if (showOnlyUnassigned) {
          url += `&unassignedOnly=true`
        }
        
        console.log("Fetching registered players with URL:", url);
        
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error('Failed to fetch registered players')
        }
        
        const data = await response.json()
        console.log("API response:", data);
        setSearchResults(data.players || [])
        setDebugInfo(data.debug || null)
      } else {
        // Use the existing users/search API for the "all users" option
        const searchUrl = `/api/users/search?q=${encodeURIComponent(searchQuery)}`
        
        const response = await fetch(searchUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error('Failed to search users')
        }
        
        const data = await response.json()
        setSearchResults(data.users || [])
      }
    } catch (error) {
      console.error('Error searching users:', error)
      toast({
        title: "Search Error",
        description: "Failed to search for users. Please try again.",
        variant: "destructive"
      })
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }
  
  const handleAddMember = async (userId: string) => {
    try {
      setProcessingMemberId(userId)
      await addTeamMember(teamId, userId)
      
      // Refresh team data
      const updatedTeam = await getTeamWithMembers(teamId)
      setTeam(updatedTeam)
      
      // Remove user from search results
      setSearchResults(prev => prev.filter(user => user.id !== userId))
      
      toast({
        title: "Member added",
        description: "The member has been added to the team successfully."
      })
    } catch (error) {
      console.error("Error adding member:", error)
      toast({
        title: "Error adding member",
        description: error instanceof Error ? error.message : "Failed to add member to the team.",
        variant: "destructive"
      })
    } finally {
      setProcessingMemberId(null)
    }
  }
  
  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member from the team?")) {
      return
    }
    
    try {
      setProcessingMemberId(userId)
      await removeTeamMember(teamId, userId)
      
      // Refresh team data
      const updatedTeam = await getTeamWithMembers(teamId)
      setTeam(updatedTeam)
      
      toast({
        title: "Member removed",
        description: "The member has been removed from the team successfully."
      })
    } catch (error) {
      console.error("Error removing member:", error)
      toast({
        title: "Error removing member",
        description: error instanceof Error ? error.message : "Failed to remove member from the team.",
        variant: "destructive"
      })
    } finally {
      setProcessingMemberId(null)
    }
  }
  
  const handleSetCaptain = async (userId: string) => {
    if (!confirm("Are you sure you want to set this member as the team captain?")) {
      return
    }
    
    try {
      setProcessingMemberId(userId)
      await updateTeamCaptain(teamId, userId)
      
      // Refresh team data
      const updatedTeam = await getTeamWithMembers(teamId)
      setTeam(updatedTeam)
      
      toast({
        title: "Captain updated",
        description: "The team captain has been updated successfully."
      })
    } catch (error) {
      console.error("Error setting captain:", error)
      toast({
        title: "Error setting captain",
        description: error instanceof Error ? error.message : "Failed to set team captain.",
        variant: "destructive"
      })
    } finally {
      setProcessingMemberId(null)
    }
  }
  
  const getUserInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }
  
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link href="/admin/teams">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Teams
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
        </div>
        <Separator />
        <div className="h-64 bg-muted animate-pulse rounded-md"></div>
      </div>
    )
  }
  
  if (error || !team) {
    return (
      <div className="p-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link href="/admin/teams">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Teams
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
        </div>
        <Separator className="my-6" />
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || "Team not found. Please check the team ID and try again."}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild>
            <Link href="/admin/teams">Return to Teams</Link>
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link href="/admin/teams">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Teams
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{team.name} Members</h1>
          <p className="text-muted-foreground">
            Manage team members for {team.competition?.name || "the competition"}
          </p>
        </div>
      </div>
      
      <Separator className="my-6" />
      
      <div className="flex justify-end mb-6">
        <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>
                Search for users to add to {team.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="flex gap-2">
                <Tabs value={searchType} onValueChange={(value) => setSearchType(value as "all" | "registered")} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="registered">Registered</TabsTrigger>
                    <TabsTrigger value="all">All Users</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="grid flex-1 gap-2">
                  <Label htmlFor="name" className="sr-only">
                    Search
                  </Label>
                  <Input
                    id="search"
                    placeholder="Search by name or email"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button type="button" onClick={handleSearch} size="sm">
                  Search
                </Button>
              </div>
              
              {searchType === "registered" && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="unassignedOnly" 
                      checked={showOnlyUnassigned} 
                      onCheckedChange={(checked) => {
                        setShowOnlyUnassigned(checked === true);
                        // Clear previous search results when toggling this option
                        setSearchResults([]);
                        // Immediately perform a new search with the updated filter
                        setTimeout(() => handleSearch(), 0);
                      }}
                    />
                    <Label htmlFor="unassignedOnly">Show only unassigned players</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {showOnlyUnassigned 
                      ? "Showing users registered for this competition who are not yet assigned to a team." 
                      : "Showing all users registered for this competition."}
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      // Search with empty query to show all registered players
                      setSearchQuery("");
                      handleSearch();
                    }}
                  >
                    Show All Registered Players
                  </Button>
                </div>
              )}
            </div>
            
            <div className="max-h-[300px] overflow-y-auto">
              {searchLoading ? (
                <div className="py-4 text-center">
                  <div className="h-10 w-10 mx-auto rounded-full bg-muted animate-pulse"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Searching...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                            <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name || "Unnamed User"}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                            {user.team && (
                              <p className="text-xs mt-1">
                                <Badge variant="outline" className="text-xs">
                                  Already on {user.team.name}
                                </Badge>
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              if (user.team) {
                                // Show confirmation if user is already on a team
                                if (confirm(`This user is already on team "${user.team.name}". Do you want to move them to this team?`)) {
                                  handleAddMember(user.id);
                                }
                              } else {
                                handleAddMember(user.id);
                              }
                            }}
                            disabled={processingMemberId === user.id}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            {user.team ? "Move" : "Add"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : searchQuery || searchType === "registered" ? (
                <div className="py-4 text-center">
                  <p className="text-muted-foreground">
                    {searchType === "registered" 
                      ? "No registered players found that match your criteria."
                      : "No users found. Try a different search term."}
                  </p>
                  
                  {debugInfo && (
                    <div className="mt-4 p-3 border rounded text-xs text-left bg-muted/30">
                      <details>
                        <summary className="cursor-pointer font-medium">Debug Information</summary>
                        <div className="mt-2 space-y-1">
                          <p>Registered users: {debugInfo.registeredCount || 0}</p>
                          <p>Users matched: {debugInfo.userMatchCount || 0}</p>
                          <p>Results returned: {debugInfo.returnedCount || 0}</p>
                          <p>UserCompetition records: {debugInfo.userCompCount || 0}</p>
                          {debugInfo.assignedCount !== undefined && (
                            <>
                              <p>Assigned users: {debugInfo.assignedCount}</p>
                              <p>Unassigned users: {debugInfo.unassignedCount}</p>
                            </>
                          )}
                          {debugInfo.message && (
                            <p className="text-orange-600">{debugInfo.message}</p>
                          )}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              ) : (
                <p className="py-4 text-center text-muted-foreground">
                  Enter a search term to find users.
                </p>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddMemberDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Members of {team?.name || "Team"} in {team?.competition?.name || "Competition"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {team?.members?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No members</h3>
              <p className="text-muted-foreground text-sm mt-1 mb-4">This team has no members yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team?.members?.map((member: any) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.image} alt={member.name} />
                          <AvatarFallback>{getUserInitials(member.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">{member.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {team.captainId === member.id ? (
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                            <Crown className="h-3 w-3 mr-1" />
                            Captain
                          </Badge>
                        ) : (
                          <Badge variant="outline">Member</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">Score Not Available</span>
                    </TableCell>
                    <TableCell>
                      {playerScores[member.id]?.position || member.position || (
                        <span className="text-muted-foreground text-sm">Not set</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {team.captainId !== member.id && (
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleSetCaptain(member.id)}
                            disabled={processingMemberId === member.id}
                          >
                            <Crown className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={processingMemberId === member.id}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 