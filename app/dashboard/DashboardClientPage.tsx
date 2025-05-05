"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Users, Award, Activity, Crown, Medal, Star, Trophy, Shield, CalendarX } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { TeamOverview } from "@/components/dashboard/team-overview"
import { RecentGames } from "@/components/dashboard/recent-games"
import { PlayerStats } from "@/components/dashboard/player-stats"
import { TeamRankings } from "@/components/dashboard/team-rankings"
import { AuthDemo } from "@/components/auth-demo"
import { TeamsTab } from "@/components/dashboard/teams-tab"
import { PlayersTab } from "@/components/dashboard/players-tab"
import { GamesTab } from "@/components/dashboard/games-tab"
import { CompetitionsTab } from "@/components/dashboard/competitions-tab"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { CaptainGameAssignments } from "@/components/dashboard/captain-game-assignments"
import { Skeleton } from "@/components/ui/skeleton"
import { CaptainTodoList } from "@/components/dashboard/captain-todo-list"
import { CompetitionTimeline } from "@/components/competition-timeline"
import { Badge } from "@/components/ui/badge"
import { getDashboardStats, getUserDashboardProfile } from "@/app/actions/dashboard-stats"
import { getCompetitions } from "@/app/actions/competitions"
import { getUserCompetitionRegistrations } from "@/app/actions/competitions"
import { DashboardLoading } from "@/components/dashboard/dashboard-loading"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getUserTeam } from "@/app/actions/teams"
import { MyTeamTab } from "@/components/dashboard/my-team-tab"

// Define interface for competition
interface Competition {
  id: string
  name: string
  year: number
  status: string
}

function AdminDashboard() {
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>("")
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null)
  
  // Fetch available competitions - admin sees all
  useEffect(() => {
    async function fetchCompetitions() {
      try {
        // Replace API call with direct server action
        const competitions = await getCompetitions();
        
        if (competitions && competitions.length > 0) {
          setCompetitions(competitions);
          // Default to the active competition or first in the list
          const activeComp = competitions.find((c: Competition) => c.status === "active");
          if (activeComp) {
            setSelectedCompetitionId(activeComp.id);
            setSelectedCompetition(activeComp);
          } else if (competitions.length > 0) {
            setSelectedCompetitionId(competitions[0].id);
            setSelectedCompetition(competitions[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching competitions:", err);
      }
    }
    
    fetchCompetitions();
  }, []);
  
  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await getDashboardStats(selectedCompetitionId)
        setDashboardStats(stats)
      } catch (error) {
        console.error("Error loading dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }
    
    if (selectedCompetitionId) {
      loadStats()
    }
  }, [selectedCompetitionId])
  
  function handleCompetitionChange(value: string) {
    setSelectedCompetitionId(value);
    const selected = competitions.find(c => c.id === value);
    if (selected) {
      setSelectedCompetition(selected);
    }
  }
  
  const renderStatCard = (title: string, value: string | number, subtitle: string, icon: React.ReactNode) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  )

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 animate-in fade-in-50 duration-500">
      <DashboardHeader competitionName={selectedCompetition?.name} competitionYear={selectedCompetition?.year} />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Dashboard Overview</h2>
          <p className="text-muted-foreground">View and manage competition data</p>
        </div>
        
        <div className="w-72">
          <Select value={selectedCompetitionId} onValueChange={handleCompetitionChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a competition" />
            </SelectTrigger>
            <SelectContent>
              {competitions.map((comp) => (
                <SelectItem key={comp.id} value={comp.id}>
                  {comp.name} ({comp.year}) - {comp.status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <CompetitionTimeline competitionId={selectedCompetitionId} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex w-full overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="competitions">Competitions</TabsTrigger>
          <TabsTrigger value="my-profile">My Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                    <div className="h-4 w-4 bg-muted rounded-full animate-pulse"></div>
              </CardHeader>
              <CardContent>
                    <div className="h-7 w-12 bg-muted rounded animate-pulse mt-1 mb-2"></div>
                    <div className="h-3 w-28 bg-muted rounded animate-pulse"></div>
              </CardContent>
            </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {renderStatCard(
                "Total Teams",
                dashboardStats?.teams.count || 0,
                `${dashboardStats?.teams.difference > 0 ? '+' : ''}${dashboardStats?.teams.difference || 0} from last year`,
                <Users className="h-4 w-4 text-muted-foreground" />
              )}
              
              {renderStatCard(
                "Registered Players",
                dashboardStats?.players.count || 0,
                `${dashboardStats?.players.difference > 0 ? '+' : ''}${dashboardStats?.players.difference || 0} from last year`,
                <Award className="h-4 w-4 text-muted-foreground" />
              )}
              
              {renderStatCard(
                "Games Scheduled",
                dashboardStats?.games.total || 0,
                `${dashboardStats?.games.completed || 0} completed, ${dashboardStats?.games.upcoming || 0} upcoming`,
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              )}
              
              {renderStatCard(
                "Days Remaining",
                dashboardStats?.competition.daysRemaining ?? "N/A",
                "Until competition ends",
                <Activity className="h-4 w-4 text-muted-foreground" />
              )}
          </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Team Rankings</CardTitle>
                <CardDescription>Current standings in the {dashboardStats?.competition.year} {dashboardStats?.competition.name} competition</CardDescription>
              </CardHeader>
              <CardContent>
                <TeamRankings />
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Recent Games</CardTitle>
                <CardDescription>Latest game results and upcoming matches</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentGames />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Team Overview</CardTitle>
                <CardDescription>Your team's performance and statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <TeamOverview />
              </CardContent>
            </Card>

            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Top Players</CardTitle>
                <CardDescription>Players with the highest performance scores</CardDescription>
              </CardHeader>
              <CardContent>
                <PlayerStats />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <TeamsTab />
        </TabsContent>

        <TabsContent value="players" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <PlayersTab />
        </TabsContent>

        <TabsContent value="games" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <GamesTab selectedCompetitionId={selectedCompetitionId} />
        </TabsContent>

        <TabsContent value="competitions" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <CompetitionsTab />
        </TabsContent>

        <TabsContent value="my-profile" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <MyProfileTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MyProfileTab() {
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getUserDashboardProfile()
        setProfileData(data)
      } catch (error) {
        console.error("Error loading user profile:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadProfile()
  }, [])
  
  if (loading) {
    return <DashboardLoading />
  }

  return (
    <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
            <CardTitle>Player Profile</CardTitle>
            <CardDescription>Your personal information and statistics</CardDescription>
              </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16">
                          <AvatarImage
                  src={profileData?.image || `/placeholder.svg?height=64&width=64&text=${profileData?.name?.substring(0, 2) || 'U'}`}
                  alt={profileData?.name || "User"}
                          />
                <AvatarFallback>{profileData?.name?.substring(0, 2) || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                <h3 className="text-lg font-semibold">{profileData?.name || "User"}</h3>
                <p className="text-sm text-muted-foreground">Team: {profileData?.team?.name || "Unassigned"}</p>
                        </div>
                      </div>

                <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Proficiency Score</p>
                  <p className="text-lg font-medium">{profileData?.score || 0}/100</p>
                      </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Games Played</p>
                  <p className="text-lg font-medium">{profileData?.stats?.gamesPlayed || 0}/{profileData?.stats?.gamesTotal || 0}</p>
                        </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Accolades</p>
                  <p className="text-lg font-medium">{profileData?.stats?.accolades?.length || 0}</p>
                          </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Team Rank</p>
                  <p className="text-lg font-medium">#{profileData?.team?.rank || "-"}</p>
                          </div>
                        </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold mb-2">About</h4>
                <p className="text-sm text-muted-foreground">
                  {profileData?.bio || `Player with the ${profileData?.team?.name || "team"}. Participating in ${profileData?.competition?.name || "the competition"}.`}
                </p>
                      </div>
                </div>
              </CardContent>
            </Card>

          <Card>
            <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Your skills and proficiency ratings</CardDescription>
            </CardHeader>
          <CardContent className="space-y-6">
            {profileData?.proficiencies?.map((prof: any, i: number) => (
              <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{prof.name}</p>
                  <p className="text-sm font-medium">{prof.score}/100</p>
                  </div>
                <Progress value={prof.score} className="h-2" />
                </div>
            )) || (
              <div className="text-sm text-muted-foreground">No proficiency data available</div>
            )}
            </CardContent>
          </Card>
      </div>

          <Card>
            <CardHeader>
          <CardTitle>Participation History</CardTitle>
          <CardDescription>Your activity in recent games</CardDescription>
            </CardHeader>
        <CardContent>
          {profileData?.stats?.recentGames?.length > 0 ? (
                <div className="rounded-md border">
              <div className="grid grid-cols-4 p-4 font-medium">
                    <div>Game</div>
                    <div>Date</div>
                <div>Result</div>
                <div>Performance</div>
                  </div>
                  <div className="divide-y">
                {profileData.stats.recentGames.map((game: any, i: number) => (
                  <div key={i} className="grid grid-cols-4 p-4 items-center">
                    <div className="text-sm font-medium">{game.name}</div>
                    <div className="text-sm">{new Date(game.date).toLocaleDateString()}</div>
                          <div className="text-sm">
                      <span className={game.isWinner ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {game.isWinner ? "Won" : "Lost"}
                              </span>
                        </div>
                        <div className="text-sm">
                      <Badge variant={game.performance ? "default" : "outline"} className="text-xs">
                        {game.performance || "Not rated"}
                      </Badge>
                        </div>
                      </div>
                ))}
                        </div>
                        </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <CalendarX className="mx-auto h-10 w-10 mb-2 opacity-50" />
              <p>No participation history available</p>
              <p className="text-sm">Your game participation will appear here once you've played in a game.</p>
                        </div>
                      )}
            </CardContent>
          </Card>
                  </div>
  );
}

function CaptainDashboard({ user }: { user: any }) {
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>("")
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null)
  const [hasRegistrations, setHasRegistrations] = useState(true)
  const router = useRouter()
  
  // Fetch available competitions - only show registered ones
  useEffect(() => {
    async function fetchCompetitions() {
      try {
        // Get user's registered competitions
        const userRegistrations = await getUserCompetitionRegistrations();
        
        if (userRegistrations && userRegistrations.length > 0) {
          // Map registrations to competition objects
          const registeredCompetitions = userRegistrations.map(reg => ({
            id: reg.competitionId,
            name: reg.competition.name,
            year: reg.competition.year,
            status: reg.competition.status
          }));
          
          setCompetitions(registeredCompetitions);
          setHasRegistrations(true);
          
          // Default to the active competition or first in the list
          const activeComp = registeredCompetitions.find((c: Competition) => c.status === "active");
          if (activeComp) {
            setSelectedCompetitionId(activeComp.id);
            setSelectedCompetition(activeComp);
          } else if (registeredCompetitions.length > 0) {
            setSelectedCompetitionId(registeredCompetitions[0].id);
            setSelectedCompetition(registeredCompetitions[0]);
          }
        } else {
          // Captain has no registered competitions
          setHasRegistrations(false);
          setCompetitions([]);
        }
      } catch (err) {
        console.error("Error fetching competitions:", err);
        setHasRegistrations(false);
      }
    }
    
    fetchCompetitions();
  }, []);
  
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getUserDashboardProfile()
        setProfileData(data)
      } catch (error) {
        console.error("Error loading user profile:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadProfile()
  }, [])
  
  function handleCompetitionChange(value: string) {
    setSelectedCompetitionId(value);
    const selected = competitions.find(c => c.id === value);
    if (selected) {
      setSelectedCompetition(selected);
    }
  }
  
  if (loading) {
    return <DashboardLoading />
  }
  
  // If captain has no registrations, show empty state
  if (!hasRegistrations) {
    return (
      <div className="flex flex-col gap-8 p-4 md:p-8 animate-in fade-in-50 duration-500">
        <DashboardHeader competitionName="No Competitions" competitionYear={new Date().getFullYear()} />

        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-xl mx-auto">
          <div className="bg-muted rounded-full p-6 mb-6">
            <Trophy className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Not Registered for Any Competitions</h2>
          <p className="text-muted-foreground mb-6">
            You need to register for competitions before you can view your dashboard.
            Browse available competitions and register to get started.
          </p>
          <Button size="lg" onClick={() => router.push('/competitions')}>
            View Available Competitions
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 animate-in fade-in-50 duration-500">
      <DashboardHeader competitionName={selectedCompetition?.name} competitionYear={selectedCompetition?.year} />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Team Captain Dashboard</h2>
          <p className="text-muted-foreground">Manage your team and games</p>
        </div>
        
        <div className="w-72">
          <Select value={selectedCompetitionId} onValueChange={handleCompetitionChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a competition" />
            </SelectTrigger>
            <SelectContent>
              {competitions.map((comp) => (
                <SelectItem key={comp.id} value={comp.id}>
                  {comp.name} ({comp.year}) - {comp.status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <CompetitionTimeline competitionId={selectedCompetitionId} />

      <Tabs defaultValue="team-overview" className="space-y-4">
        <TabsList className="flex w-full overflow-x-auto">
          <TabsTrigger value="team-overview">Team Overview</TabsTrigger>
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="my-profile">My Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="team-overview" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Rank</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">#{profileData?.team?.rank || "-"}</div>
                <p className="text-xs text-muted-foreground">Out of {8} teams</p>
              </CardContent>
            </Card>

          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Score</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{profileData?.team?.score || 0}</div>
                <p className="text-xs text-muted-foreground">Team performance points</p>
            </CardContent>
          </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profileData?.stats?.winRate || 0}%</div>
                <p className="text-xs text-muted-foreground">From {profileData?.stats?.gamesPlayed || 0} games</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Games Left</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profileData?.stats?.gamesTotal - profileData?.stats?.gamesPlayed || 0}</div>
                <p className="text-xs text-muted-foreground">Games to be played</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader className="flex justify-between">
                <div>
                  <CardTitle>Team Todo List</CardTitle>
                  <CardDescription>Tasks that need your attention</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <CaptainTodoList />
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Recent Games</CardTitle>
                <CardDescription>Latest game results and upcoming matches</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentGames />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Team Overview</CardTitle>
                <CardDescription>Your team's performance and statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <TeamOverview />
              </CardContent>
            </Card>

            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Team Rankings</CardTitle>
                <CardDescription>See how your team stacks up against the competition</CardDescription>
              </CardHeader>
              <CardContent>
                <TeamRankings />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="games" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <GamesTab selectedCompetitionId={selectedCompetitionId} />
        </TabsContent>

        <TabsContent value="players" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <PlayerStats />
        </TabsContent>

        <TabsContent value="my-profile" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <MyProfileTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PlayerDashboard({ user }: { user: any }) {
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>("")
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null)
  const [hasRegistrations, setHasRegistrations] = useState(true)
  const [teamData, setTeamData] = useState<any>(null)
  const [teamLoading, setTeamLoading] = useState(true)
  const router = useRouter()
  
  // Fetch available competitions - only show registered ones
  useEffect(() => {
    async function fetchCompetitions() {
      try {
        // Get user's registered competitions
        const userRegistrations = await getUserCompetitionRegistrations();
        
        if (userRegistrations && userRegistrations.length > 0) {
          // Map registrations to competition objects
          const registeredCompetitions = userRegistrations.map(reg => ({
            id: reg.competitionId,
            name: reg.competition.name,
            year: reg.competition.year,
            status: reg.competition.status
          }));
          
          setCompetitions(registeredCompetitions);
          setHasRegistrations(true);
          
          // Default to the active competition or first in the list
          const activeComp = registeredCompetitions.find((c: Competition) => c.status === "active");
          if (activeComp) {
            setSelectedCompetitionId(activeComp.id);
            setSelectedCompetition(activeComp);
          } else if (registeredCompetitions.length > 0) {
            setSelectedCompetitionId(registeredCompetitions[0].id);
            setSelectedCompetition(registeredCompetitions[0]);
          }
        } else {
          // Player has no registered competitions
          setHasRegistrations(false);
          setCompetitions([]);
        }
      } catch (err) {
        console.error("Error fetching competitions:", err);
        setHasRegistrations(false);
      }
    }
    
    fetchCompetitions();
  }, []);
  
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getUserDashboardProfile()
        setProfileData(data)
      } catch (error) {
        console.error("Error loading user profile:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadProfile()
  }, [])

  useEffect(() => {
    const loadTeamData = async () => {
      try {
        setTeamLoading(true)
        const data = await getUserTeam()
        setTeamData(data)
      } catch (error) {
        console.error("Error loading team data:", error)
      } finally {
        setTeamLoading(false)
      }
    }
    
    loadTeamData()
  }, [])
  
  function handleCompetitionChange(value: string) {
    setSelectedCompetitionId(value);
    const selected = competitions.find(c => c.id === value);
    if (selected) {
      setSelectedCompetition(selected);
    }
  }
  
  if (loading) {
    return <DashboardLoading />
  }

  // If player has no registrations, show empty state
  if (!hasRegistrations) {
    return (
      <div className="flex flex-col gap-8 p-4 md:p-8 animate-in fade-in-50 duration-500">
        <DashboardHeader competitionName="No Competitions" competitionYear={new Date().getFullYear()} />

        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-xl mx-auto">
          <div className="bg-muted rounded-full p-6 mb-6">
            <Trophy className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Not Registered for Any Competitions</h2>
          <p className="text-muted-foreground mb-6">
            You need to register for competitions before you can view your dashboard.
            Browse available competitions and register to get started.
          </p>
          <Button size="lg" onClick={() => router.push('/competitions')}>
            View Available Competitions
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 animate-in fade-in-50 duration-500">
      <DashboardHeader competitionName={selectedCompetition?.name} competitionYear={selectedCompetition?.year} />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Player Dashboard</h2>
          <p className="text-muted-foreground">Track your performance and team stats</p>
        </div>
        
        <div className="w-72">
          <Select value={selectedCompetitionId} onValueChange={handleCompetitionChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a competition" />
            </SelectTrigger>
            <SelectContent>
              {competitions.map((comp) => (
                <SelectItem key={comp.id} value={comp.id}>
                  {comp.name} ({comp.year}) - {comp.status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <CompetitionTimeline competitionId={selectedCompetitionId} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex w-full overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">My Team</TabsTrigger>
          <TabsTrigger value="games">Upcoming Games</TabsTrigger>
          <TabsTrigger value="profile">My Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
                <div className="text-2xl font-bold">{profileData?.score || 0}</div>
                <p className="text-xs text-muted-foreground">Proficiency score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Rank</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
                <div className="text-2xl font-bold">#{profileData?.team?.rank || "-"}</div>
                <p className="text-xs text-muted-foreground">{profileData?.team?.name || "Team"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Games Played</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
                <div className="text-2xl font-bold">{profileData?.stats?.gamesPlayed || 0}/{profileData?.stats?.gamesTotal || 0}</div>
                <p className="text-xs text-muted-foreground">{profileData?.stats?.participationRate || 0}% participation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accolades</CardTitle>
                <Medal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
                <div className="text-2xl font-bold">{profileData?.stats?.accolades?.length || 0}</div>
                <p className="text-xs text-muted-foreground">{profileData?.stats?.accolades?.length ? 'Recent achievements' : 'No accolades yet'}</p>
          </CardContent>
        </Card>
      </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Team Overview</CardTitle>
                <CardDescription>Your team's performance and statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <TeamOverview />
              </CardContent>
            </Card>

            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Recent Games</CardTitle>
                <CardDescription>Latest game results and upcoming matches</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentGames />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
            <CardHeader>
                <CardTitle>Team Rankings</CardTitle>
                <CardDescription>Current standings in the competition</CardDescription>
            </CardHeader>
            <CardContent>
                <TeamRankings />
            </CardContent>
          </Card>

            <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Top Players</CardTitle>
                <CardDescription>Players with the highest performance scores</CardDescription>
            </CardHeader>
            <CardContent>
                <PlayerStats />
            </CardContent>
          </Card>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <MyTeamTab />
        </TabsContent>

        <TabsContent value="games" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <GamesTab selectedCompetitionId={selectedCompetitionId} />
        </TabsContent>

        <TabsContent value="profile" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <MyProfileTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function DashboardClientPage() {
  const { data: session, status } = useSession()
  const user = session?.user

  // Show loading state while checking authentication
  if (status === "loading") {
    return <DashboardLoading />
  }

  // The parent component (page.tsx) now uses ProtectedRoute
  // so we know the user is authenticated when this renders

  // Render different dashboards based on user role
  if (user?.role === "admin") {
    return <AdminDashboard />
  } else if (user?.role === "captain") {
    return <CaptainDashboard user={user} />
  } else {
    return <PlayerDashboard user={user} />
  }
}

