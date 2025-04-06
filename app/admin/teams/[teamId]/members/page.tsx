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
  
  // Load team data
  useEffect(() => {
    async function loadTeam() {
      try {
        setLoading(true)
        const teamData = await getTeamWithMembers(teamId)
        setTeam(teamData)
      } catch (error) {
        console.error("Error loading team:", error)
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
    
    loadTeam()
  }, [teamId, toast])
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    try {
      setSearchLoading(true)
      
      // Check if we have the team's competition ID
      const competitionId = team.competition?.id
      
      // Create the search endpoint URL with appropriate query parameters
      let searchUrl = `/api/users/search?q=${encodeURIComponent(searchQuery)}`
      
      if (searchType === "registered" && competitionId) {
        searchUrl += `&competitionId=${competitionId}&unassignedOnly=true`
      }
      
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
                <p className="text-sm text-muted-foreground">
                  Showing users registered for {team.competition?.name || "this competition"} who are not yet assigned to a team.
                </p>
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
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAddMember(user.id)}
                            disabled={processingMemberId === user.id}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : searchQuery ? (
                <p className="py-4 text-center text-muted-foreground">
                  No users found. Try a different search term.
                </p>
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
      
      <Card>
        <CardHeader>
          <CardTitle>{team.name} Members ({team.members.length})</CardTitle>
          <CardDescription>
            {team.competition?.name && `Competition: ${team.competition.name}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {team.members.length === 0 ? (
            <div className="py-8 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <UserPlus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No Members</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                This team doesn't have any members yet. Add members to the team to get started.
              </p>
              <Button variant="outline" onClick={() => setAddMemberDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Team Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.members.map((member: any) => (
                  <TableRow key={member.id}>
                    <TableCell className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={member.image || ""} alt={member.name || "User"} />
                        <AvatarFallback>{getUserInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name || "Unnamed User"}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        member.role === "admin" 
                          ? "bg-blue-50 text-blue-700 hover:bg-blue-50" 
                          : "bg-green-50 text-green-700 hover:bg-green-50"
                      }>
                        {member.role === "admin" ? (
                          <Shield className="h-3 w-3 mr-1 inline-block" />
                        ) : null}
                        {member.role || "User"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {team.captain?.id === member.id ? (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                          <Crown className="h-3 w-3 mr-1 inline-block" />
                          Captain
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-slate-50 text-slate-700 hover:bg-slate-50">
                          Member
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {team.captain?.id !== member.id && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSetCaptain(member.id)}
                            disabled={processingMemberId === member.id}
                          >
                            <Crown className="h-4 w-4 mr-1" />
                            Make Captain
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={processingMemberId === member.id}
                        >
                          <UserMinus className="h-4 w-4 mr-1" />
                          Remove
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