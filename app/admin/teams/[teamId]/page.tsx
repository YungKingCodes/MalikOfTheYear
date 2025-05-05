"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { ChevronLeft, UserPlus, Users, Award, Trophy, CalendarDays, Crown, UserCheck, LogIn } from "lucide-react"
import { getTeamWithMembers, updateTeam, updateTeamCaptain, addTeamMember } from "@/app/actions/teams"
import { getCompetitions } from "@/app/actions/competitions"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

// Form validation schema
const teamFormSchema = z.object({
  name: z.string().min(3, "Team name must be at least 3 characters").max(100),
  competitionId: z.string().min(1, "Please select a competition")
})

type TeamFormValues = z.infer<typeof teamFormSchema>

export default function TeamDetailsPage({ params }: { params: { teamId: string } }) {
  const { teamId } = params
  const router = useRouter()
  const { toast } = useToast()
  const { data: session } = useSession()
  
  const [team, setTeam] = useState<any>(null)
  const [competitions, setCompetitions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdatingCaptain, setIsUpdatingCaptain] = useState(false)
  const [isJoiningTeam, setIsJoiningTeam] = useState(false)
  const [confirmJoinDialogOpen, setConfirmJoinDialogOpen] = useState(false)
  const [teamScores, setTeamScores] = useState<any>(null)
  const [scoresLoading, setScoresLoading] = useState(false)
  
  // Get the current user's ID
  const currentUserId = session?.user?.id
  
  // Check if current user is on this team
  const isOnTeam = team?.members?.some((member: any) => member.id === currentUserId)
  
  // Check if current user is the captain
  const isCaptain = team?.captain?.id === currentUserId
  
  // Initialize form
  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: "",
      competitionId: ""
    }
  })
  
  // Load team and competitions data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        
        // Load team data
        const teamData = await getTeamWithMembers(teamId)
        setTeam(teamData)
        
        // Set form default values
        form.reset({
          name: teamData.name,
          competitionId: teamData.competitionId
        })
        
        // Load competitions
        const competitionsData = await getCompetitions()
        setCompetitions(competitionsData)
        
        // Load team scores if we have a competition ID
        if (teamData.competitionId) {
          loadTeamScores(teamData.competitionId)
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
  }, [teamId, form, toast])
  
  // Function to load team scores
  const loadTeamScores = async (competitionId: string) => {
    if (!competitionId) return
    
    setScoresLoading(true)
    try {
      const response = await fetch(`/api/teams/${teamId}/scores?competitionId=${competitionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch team scores')
      }
      
      const data = await response.json()
      setTeamScores(data)
    } catch (error) {
      console.error('Error fetching team scores:', error)
      toast({
        title: "Error",
        description: "Failed to load team scores. Some data may be incomplete.",
        variant: "destructive"
      })
    } finally {
      setScoresLoading(false)
    }
  }
  
  async function onSubmit(data: TeamFormValues) {
    setIsSubmitting(true)
    try {
      const result = await updateTeam(teamId, {
        name: data.name,
        competitionId: data.competitionId
      })
      
      if (result.success) {
        // Update local state with the new data
        setTeam({
          ...team,
          name: data.name,
          competitionId: data.competitionId,
          competition: competitions.find((c) => c.id === data.competitionId)
        })
        
        toast({
          title: "Team updated",
          description: "The team has been updated successfully."
        })
      }
    } catch (error) {
      console.error("Error updating team:", error)
      toast({
        title: "Error updating team",
        description: error instanceof Error ? error.message : "Failed to update team",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  async function handleCaptainChange(userId: string) {
    if (!userId) return
    
    setIsUpdatingCaptain(true)
    try {
      await updateTeamCaptain(teamId, userId)
      
      // Update local state
      const updatedTeam = await getTeamWithMembers(teamId)
      setTeam(updatedTeam)
      
      toast({
        title: "Captain updated",
        description: "The team captain has been updated successfully."
      })
    } catch (error) {
      console.error("Error updating team captain:", error)
      toast({
        title: "Error updating captain",
        description: error instanceof Error ? error.message : "Failed to update team captain",
        variant: "destructive"
      })
    } finally {
      setIsUpdatingCaptain(false)
    }
  }

  async function handleJoinTeam() {
    if (!currentUserId) return
    
    setIsJoiningTeam(true)
    try {
      await addTeamMember(teamId, currentUserId)
      
      // Update local state
      const updatedTeam = await getTeamWithMembers(teamId)
      setTeam(updatedTeam)
      
      toast({
        title: "Joined team",
        description: `You have successfully joined ${team.name}.`
      })
      
      setConfirmJoinDialogOpen(false)
    } catch (error) {
      console.error("Error joining team:", error)
      toast({
        title: "Error joining team",
        description: error instanceof Error ? error.message : "Failed to join team",
        variant: "destructive"
      })
    } finally {
      setIsJoiningTeam(false)
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Team Details</h1>
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
          <h1 className="text-3xl font-bold tracking-tight">Team Details</h1>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link href="/admin/teams">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Teams
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
            <p className="text-muted-foreground">
              Team details and settings
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {isOnTeam ? (
            <Button asChild variant="default">
              <Link href="/dashboard">
                <UserCheck className="h-4 w-4 mr-2" />
                My Dashboard
              </Link>
            </Button>
          ) : (
            <Dialog open={confirmJoinDialogOpen} onOpenChange={setConfirmJoinDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default">
                  <LogIn className="h-4 w-4 mr-2" />
                  Join Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join Team</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to join {team.name}? You'll be participating as a player in this team.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p>
                    As an admin, you'll still have access to all admin functions, but joining a team allows you to:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Participate in team activities</li>
                    <li>Vote in team captain elections</li>
                    <li>Compete in games with your team</li>
                  </ul>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setConfirmJoinDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleJoinTeam} disabled={isJoiningTeam}>
                    {isJoiningTeam ? "Joining..." : "Confirm Join"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          <Button asChild variant="outline">
            <Link href={`/admin/teams/${teamId}/members`}>
              <UserPlus className="h-4 w-4 mr-2" />
              Manage Members
            </Link>
          </Button>
        </div>
      </div>
      
      <Separator className="my-6" />
      
      {isOnTeam && (
        <Alert className="mb-6">
          <UserCheck className="h-4 w-4" />
          <AlertTitle>You are a member of this team</AlertTitle>
          <AlertDescription>
            You're currently participating as a {isCaptain ? "captain" : "player"} on {team.name}.
            Visit your <Link href="/dashboard" className="underline font-medium">dashboard</Link> to view team activities.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Team info card */}
        <Card>
          <CardHeader>
            <CardTitle>Team Overview</CardTitle>
            <CardDescription>Current team status and information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-muted-foreground">Competition:</span>
              <span className="font-medium">{team.competition?.name || "Unassigned"}</span>
            </div>
            
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-muted-foreground">Members:</span>
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{team.members?.length || 0} Members</span>
              </div>
            </div>
            
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-muted-foreground">Team Score:</span>
              <div className="flex items-center">
                <Award className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{team.score || 0} Points</span>
              </div>
            </div>
            
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-muted-foreground">Captain:</span>
              {team.captain ? (
                <Badge variant="outline" className="w-fit">
                  <Trophy className="mr-1 h-3 w-3" />
                  {team.captain.name}
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50 w-fit">
                  No Captain Assigned
                </Badge>
              )}
            </div>
            
            {team.competition?.status && (
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Competition Status:</span>
                <Badge 
                  variant="outline" 
                  className={
                    team.competition.status === "active" 
                      ? "bg-green-50 text-green-700 hover:bg-green-50 w-fit" 
                      : team.competition.status === "completed"
                      ? "bg-blue-50 text-blue-700 hover:bg-blue-50 w-fit"
                      : "bg-amber-50 text-amber-700 hover:bg-amber-50 w-fit"
                  }
                >
                  <CalendarDays className="mr-1 h-3 w-3" />
                  {team.competition.status === "active" 
                    ? "Active" 
                    : team.competition.status === "completed"
                    ? "Completed"
                    : "Upcoming"}
                </Badge>
              </div>
            )}
          </CardContent>
          {!isOnTeam && (
            <CardFooter className="pt-0">
              <Button 
                onClick={() => setConfirmJoinDialogOpen(true)} 
                className="w-full" 
                variant="outline"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Join as Player
              </Button>
            </CardFooter>
          )}
        </Card>
        
        {/* Team edit form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Edit Team</CardTitle>
            <CardDescription>Update team information</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter team name" {...field} />
                      </FormControl>
                      <FormDescription>
                        The display name of the team.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="competitionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Competition</FormLabel>
                      <FormControl>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                          disabled={team.members?.length > 0}
                        >
                          <SelectTrigger>
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
                      </FormControl>
                      {team.members?.length > 0 && (
                        <FormDescription className="text-amber-500">
                          Competition cannot be changed when the team has members.
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !form.formState.isDirty}
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        {/* Captain Selection */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Team Captain</CardTitle>
            <CardDescription>
              Select a team member to serve as captain
            </CardDescription>
          </CardHeader>
          <CardContent>
            {team.members.length === 0 ? (
              <Alert>
                <AlertTitle>No Members</AlertTitle>
                <AlertDescription>
                  Add team members before assigning a captain.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <h3 className="font-medium">Current Captain</h3>
                    <p className="text-sm text-muted-foreground">
                      The current team captain is responsible for team management
                    </p>
                  </div>
                  
                  <div className="flex items-center">
                    {team.captain ? (
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2 bg-amber-50 text-amber-700">
                          <Crown className="h-3 w-3 mr-1" />
                          Captain
                        </Badge>
                        <span className="font-medium">{team.captain.name}</span>
                      </div>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        No Captain Assigned
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Change Captain</h3>
                  <div className="grid gap-2">
                    <Select
                      disabled={isUpdatingCaptain || team.members.length === 0}
                      onValueChange={handleCaptainChange}
                      value={team.captain?.id || ""}
                    >
                      <SelectTrigger className="w-full md:w-80">
                        <SelectValue placeholder="Select a team member" />
                      </SelectTrigger>
                      <SelectContent>
                        {team.members.map((member: any) => (
                          <SelectItem 
                            key={member.id} 
                            value={member.id}
                            disabled={team.captain?.id === member.id}
                          >
                            {member.name}
                            {team.captain?.id === member.id && " (Current Captain)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      The captain will have additional permissions for managing the team
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Participation */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Admin Participation</CardTitle>
            <CardDescription>
              Participate in competitions as a player or team captain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                As an admin, you can participate in competitions while maintaining your administrative privileges. This dual role allows you to:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Join teams as a regular player</li>
                <li>Be elected as a team captain</li>
                <li>Participate in team voting</li>
                <li>Compete in games</li>
                <li>Earn points and achievements</li>
              </ul>

              <Separator className="my-4" />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="font-medium mb-2">Your Current Status</h3>
                  {isOnTeam ? (
                    <div className="space-y-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 w-fit">
                        <UserCheck className="h-3 w-3 mr-1" />
                        Team Member
                      </Badge>
                      <p className="text-sm">
                        You are currently a {isCaptain ? "captain" : "member"} of {team.name}.
                      </p>
                      <Button asChild size="sm" variant="outline">
                        <Link href="/dashboard">Go to Dashboard</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 w-fit">
                        Not a Member
                      </Badge>
                      <p className="text-sm">
                        You are not currently a member of this team.
                      </p>
                      <Button 
                        size="sm" 
                        onClick={() => setConfirmJoinDialogOpen(true)}
                        disabled={isJoiningTeam}
                      >
                        {isJoiningTeam ? "Joining..." : "Join Team"}
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-medium mb-2">Team Activities</h3>
                  <div className="space-y-4">
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href="/team-captain-vote">
                        <Crown className="h-4 w-4 mr-2" />
                        Captain Voting
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href="/games">
                        View Games
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href="/competitions">
                        View Competitions
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Scores Section */}
        {(session?.user?.role === 'admin' || isCaptain) && (
          <Card className="md:col-span-3 mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Team Performance
              </CardTitle>
              <CardDescription>
                Player scores and team performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scoresLoading ? (
                <div className="py-8 text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4 animate-pulse">
                    <Award className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">Loading scores...</h3>
                </div>
              ) : teamScores ? (
                <div className="space-y-8">
                  {/* Performance Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                          <div className="h-16 w-16 rounded-full border-4 border-primary flex items-center justify-center mb-2">
                            <span className="text-2xl font-bold">{teamScores.averageScore}</span>
                          </div>
                          <h3 className="font-medium">Team Average</h3>
                          <p className="text-sm text-muted-foreground">
                            {teamScores.averageScore < 70 ? "Below Average" : 
                             teamScores.averageScore < 85 ? "Average" : "Above Average"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                          <div className="h-16 w-16 rounded-full border-4 border-green-500 flex items-center justify-center mb-2">
                            <span className="text-2xl font-bold">{teamScores.highestScore || 0}</span>
                          </div>
                          <h3 className="font-medium">Highest Score</h3>
                          <p className="text-sm text-muted-foreground">
                            Best performing player
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                          <div className="h-16 w-16 rounded-full border-4 border-amber-500 flex items-center justify-center mb-2">
                            <span className="text-2xl font-bold">{teamScores.totalMembers}</span>
                          </div>
                          <h3 className="font-medium">Team Size</h3>
                          <p className="text-sm text-muted-foreground">
                            Active players
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                          <div className="h-16 w-16 rounded-full border-4 border-blue-500 flex items-center justify-center mb-2">
                            <span className="text-2xl font-bold">{teamScores.completedAssessments || 0}</span>
                          </div>
                          <h3 className="font-medium">Assessments</h3>
                          <p className="text-sm text-muted-foreground">
                            Completed evaluations
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Separator />
                  
                  {/* Player Scores Table */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Player Performance</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Self Assessment
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          Peer Rating
                        </Badge>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          Final Score
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="w-[300px]">Player</TableHead>
                            <TableHead className="text-center">Self Assessment</TableHead>
                            <TableHead className="text-center">Peer Rating</TableHead>
                            <TableHead className="text-center">Final Score</TableHead>
                            <TableHead className="text-center">Role</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {teamScores.members.map((member: any) => (
                            <TableRow key={member.id} className="hover:bg-muted/50">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={member.image} alt={member.name} />
                                    <AvatarFallback>
                                      {member.name?.substring(0, 2).toUpperCase() || "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <span className="font-medium">{member.name}</span>
                                    {member.isCaptain && (
                                      <Badge variant="secondary" className="ml-2">
                                        <Crown className="h-3 w-3 mr-1" />
                                        Captain
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                {member.selfScore ? (
                                  <div className="flex items-center justify-center gap-1">
                                    <span className="text-sm font-medium">
                                      {member.selfScore.toFixed(1)}
                                    </span>
                                    <span className="text-xs text-muted-foreground">/5</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">Not submitted</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {member.peerScore ? (
                                  <div className="flex items-center justify-center gap-1">
                                    <span className="text-sm font-medium">
                                      {member.peerScore.toFixed(1)}
                                    </span>
                                    <span className="text-xs text-muted-foreground">/5</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">No ratings</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge 
                                  variant="secondary" 
                                  className={`font-mono ${
                                    member.finalScore >= 85 ? 'bg-green-100 text-green-800' :
                                    member.finalScore >= 70 ? 'bg-blue-100 text-blue-800' :
                                    'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {member.finalScore}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                {member.isCaptain ? (
                                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                                    <Crown className="h-3 w-3 mr-1" />
                                    Captain
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">Member</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                    <Award className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-medium">No Score Data Available</h3>
                  <p className="text-sm text-muted-foreground mt-2 mb-4">
                    Player scores will appear here once assessments are submitted.
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/admin/assessments">View Assessments</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 