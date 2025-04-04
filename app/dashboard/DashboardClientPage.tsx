"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Users, Award, Activity, Crown, Medal, Star, Trophy, Shield } from "lucide-react"
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
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { CaptainGameAssignments } from "@/components/dashboard/captain-game-assignments"
import { Skeleton } from "@/components/ui/skeleton"
import { CaptainTodoList } from "@/components/dashboard/captain-todo-list"
import { CompetitionTimeline } from "@/components/competition-timeline"
import { Badge } from "@/components/ui/badge"

function AdminDashboard() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 animate-in fade-in-50 duration-500">
      <DashboardHeader />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
        <h3 className="font-medium mb-1">You have full access</h3>
        <p className="text-sm">
          As an administrator, you have access to all platform features including competition management and your
          personal player profile. Use the tabs to switch between admin functions and your player information.
        </p>
      </div>

      <CompetitionTimeline />

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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">+2 from last year</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Registered Players</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">64</div>
                <p className="text-xs text-muted-foreground">+12 from last year</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Games Scheduled</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">12 completed, 12 upcoming</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Days Remaining</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">32</div>
                <p className="text-xs text-muted-foreground">Until competition ends</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Team Rankings</CardTitle>
                <CardDescription>Current standings in the 2025 Eid-Al-Athletes competition</CardDescription>
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
          <GamesTab />
        </TabsContent>

        <TabsContent value="competitions" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <CompetitionsTab />
        </TabsContent>

        <TabsContent value="my-profile" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold">My Player Profile</h2>
              <p className="text-muted-foreground">View and manage your personal player information</p>
            </div>
            <Button asChild>
              <Link href="/player-profile">Full Profile</Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Your Score</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92</div>
                <p className="text-xs text-muted-foreground">+5 from last week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Rank</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">#1</div>
                <p className="text-xs text-muted-foreground">Mountain Goats</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Games Played</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">9/10</div>
                <p className="text-xs text-muted-foreground">90% participation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accolades</CardTitle>
                <Medal className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-xs text-muted-foreground">Most on the team</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Proficiency Breakdown</CardTitle>
                <CardDescription>Your skills and abilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Basketball</p>
                      <p className="text-sm font-medium">95/100</p>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Soccer</p>
                      <p className="text-sm font-medium">90/100</p>
                    </div>
                    <Progress value={90} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Volleyball</p>
                      <p className="text-sm font-medium">85/100</p>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Swimming</p>
                      <p className="text-sm font-medium">80/100</p>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Games</CardTitle>
                <CardDescription>Games you're scheduled to participate in</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <CalendarDays className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            {["Basketball Tournament", "Soccer Match", "Volleyball Tournament"][i]}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(`2025-06-${15 + i}`).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Admin Settings Button */}
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/admin/competition-settings">Competition Settings</Link>
        </Button>
      </div>

      {/* Auth Demo Component for testing different roles */}
      <AuthDemo />
    </div>
  )
}

function CaptainDashboard({ user }: { user: any }) {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 animate-in fade-in-50 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Team Captain Dashboard</h1>
          <p className="text-muted-foreground">Manage your team and track performance</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
        <h3 className="font-medium mb-1">You have dual access</h3>
        <p className="text-sm">
          As a team captain, you have access to both captain management features and your personal player profile. Use
          the tabs to switch between team management and your player information.
        </p>
      </div>

      {/* Captain Todo List */}
      <CaptainTodoList />

      <CompetitionTimeline />

      <Tabs defaultValue="team" className="space-y-4">
        <TabsList className="flex w-full overflow-x-auto">
          <TabsTrigger value="team">My Team</TabsTrigger>
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="my-profile">My Profile</TabsTrigger>
          <TabsTrigger value="my-proficiencies">My Proficiencies</TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Rank</CardTitle>
                <Crown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">#1</div>
                <p className="text-xs text-muted-foreground">Out of 8 teams</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Score</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,245</div>
                <p className="text-xs text-muted-foreground">+125 this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Games Won</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8/10</div>
                <p className="text-xs text-muted-foreground">80% win rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Next Game</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2 days</div>
                <p className="text-xs text-muted-foreground">vs Royal Rams</p>
              </CardContent>
            </Card>
          </div>

          {/* Add the new CaptainGameAssignments component here */}
          <CaptainGameAssignments />

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Manage your team roster</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto">
                <div className="space-y-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={`/placeholder.svg?height=40&width=40&text=P${i + 1}`}
                            alt={`Player ${i + 1}`}
                          />
                          <AvatarFallback>P{i + 1}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{i === 0 ? user.name : `Player ${i + 1}`}</p>
                          <p className="text-xs text-muted-foreground">
                            {i === 0 ? "Captain" : `Member • Score: ${85 + Math.floor(Math.random() * 15)}`}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Games</CardTitle>
                <CardDescription>Schedule for your team</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto">
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <CalendarDays className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            {["Basketball Tournament", "Soccer Match", "Volleyball Tournament", "Relay Race"][i]}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(`2025-06-${15 + i}`).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">Mountain Goats</span>
                          </div>
                          <span className="text-sm text-muted-foreground">vs</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              {["Royal Rams", "Athletic Antelopes", "Speed Sheep", "Team 5"][i]}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
              <CardDescription>Track your team's progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Team Score</p>
                    <p className="text-sm font-medium">1,245 / 1,500</p>
                  </div>
                  <Progress value={83} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Games Won</p>
                    <p className="text-sm font-medium">8 / 10</p>
                  </div>
                  <Progress value={80} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Player Participation</p>
                    <p className="text-sm font-medium">95%</p>
                  </div>
                  <Progress value={95} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="games" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          {/* Add the CaptainGameAssignments component to the Games tab as well */}
          <CaptainGameAssignments />

          <Card>
            <CardHeader>
              <CardTitle>Team Games</CardTitle>
              <CardDescription>Track your team's game schedule and results</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[500px] overflow-y-auto">
              {/* Desktop view */}
              <div className="hidden md:block space-y-8">
                <div className="rounded-md border">
                  <div className="grid grid-cols-6 p-4 font-medium">
                    <div>Game</div>
                    <div>Date</div>
                    <div>Opponent</div>
                    <div>Location</div>
                    <div>Status</div>
                    <div className="text-right">Result</div>
                  </div>
                  <div className="divide-y">
                    {Array.from({ length: 10 }).map((_, i) => {
                      const isCompleted = i < 8
                      const isWon = i % 3 !== 1
                      return (
                        <div key={i} className="grid grid-cols-6 p-4 items-center">
                          <div className="text-sm font-medium">
                            {["Basketball", "Soccer", "Volleyball", "Relay Race", "Swimming"][i % 5]} {i + 1}
                          </div>
                          <div className="text-sm">
                            {new Date(`2025-06-${15 + i}`).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div className="text-sm">
                            {["Royal Rams", "Athletic Antelopes", "Speed Sheep", "Team 5", "Team 6"][i % 5]}
                          </div>
                          <div className="text-sm">{["Main Arena", "Field", "Court", "Track", "Pool"][i % 5]}</div>
                          <div className="text-sm">
                            {isCompleted ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Completed
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Upcoming
                              </span>
                            )}
                          </div>
                          <div className="text-right text-sm">
                            {isCompleted ? (
                              <span className={isWon ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                {isWon ? "Won" : "Lost"} ({isWon ? "78-72" : "65-70"})
                              </span>
                            ) : (
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/games/game${i + 1}`}>Assign Players</Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Mobile view */}
              <div className="md:hidden space-y-4">
                {Array.from({ length: 10 }).map((_, i) => {
                  const isCompleted = i < 8
                  const isWon = i % 3 !== 1
                  return (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium">
                          {["Basketball", "Soccer", "Volleyball", "Relay Race", "Swimming"][i % 5]} {i + 1}
                        </div>
                        <div className="text-sm">
                          {isCompleted ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Upcoming
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-y-2 mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Date</p>
                          <p className="text-sm">
                            {new Date(`2025-06-${15 + i}`).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Opponent</p>
                          <p className="text-sm">
                            {["Royal Rams", "Athletic Antelopes", "Speed Sheep", "Team 5", "Team 6"][i % 5]}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Location</p>
                          <p className="text-sm">{["Main Arena", "Field", "Court", "Track", "Pool"][i % 5]}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Result</p>
                          <p className="text-sm">
                            {isCompleted ? (
                              <span className={isWon ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                {isWon ? "Won" : "Lost"} ({isWon ? "78-72" : "65-70"})
                              </span>
                            ) : (
                              "Upcoming"
                            )}
                          </p>
                        </div>
                      </div>

                      {!isCompleted && (
                        <div className="mt-2">
                          <Button variant="outline" size="sm" className="w-full" asChild>
                            <Link href={`/games/game${i + 1}`}>Assign Players</Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Continue with other tabs... */}
        <TabsContent value="players" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Team Players</CardTitle>
              <CardDescription>Manage your team members</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[500px] overflow-y-auto">
              {/* Desktop view */}
              <div className="hidden md:block space-y-8">
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 p-4 font-medium">
                    <div>Player</div>
                    <div>Proficiency</div>
                    <div>Games Played</div>
                    <div>Accolades</div>
                    <div className="text-right">Actions</div>
                  </div>
                  <div className="divide-y">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="grid grid-cols-5 p-4 items-center">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={`/placeholder.svg?height=32&width=32&text=P${i + 1}`}
                              alt={`Player ${i + 1}`}
                            />
                            <AvatarFallback>P{i + 1}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{i === 0 ? user.name : `Player ${i + 1}`}</p>
                            <p className="text-xs text-muted-foreground">{i === 0 ? "Captain" : "Member"}</p>
                          </div>
                        </div>
                        <div className="text-sm">{85 + Math.floor(Math.random() * 15)}</div>
                        <div className="text-sm">{8 + Math.floor(Math.random() * 3)}/10</div>
                        <div className="text-sm">
                          {i % 3 === 0 ? "MVP, Team Player" : i % 3 === 1 ? "Sharpshooter" : "Defensive Wall"}
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            Stats
                          </Button>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile view */}
              <div className="md:hidden space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={`/placeholder.svg?height=40&width=40&text=P${i + 1}`}
                          alt={`Player ${i + 1}`}
                        />
                        <AvatarFallback>P{i + 1}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{i === 0 ? user.name : `Player ${i + 1}`}</p>
                        <p className="text-sm text-muted-foreground">{i === 0 ? "Captain" : "Member"}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Proficiency</p>
                        <p className="text-sm">{85 + Math.floor(Math.random() * 15)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Games Played</p>
                        <p className="text-sm">{8 + Math.floor(Math.random() * 3)}/10</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground">Accolades</p>
                        <p className="text-sm">
                          {i % 3 === 0 ? "MVP, Team Player" : i % 3 === 1 ? "Sharpshooter" : "Defensive Wall"}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        Stats
                      </Button>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Team Statistics</CardTitle>
                <CardDescription>Performance metrics for your team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Win Rate</p>
                      <p className="text-sm font-medium">80%</p>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Average Score</p>
                      <p className="text-sm font-medium">75 points</p>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Team Coordination</p>
                      <p className="text-sm font-medium">85%</p>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Defense Rating</p>
                      <p className="text-sm font-medium">70%</p>
                    </div>
                    <Progress value={70} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Player Contributions</CardTitle>
                <CardDescription>Individual performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={`/placeholder.svg?height=24&width=24&text=P${i + 1}`}
                              alt={`Player ${i + 1}`}
                            />
                            <AvatarFallback>P{i + 1}</AvatarFallback>
                          </Avatar>
                          <p className="text-sm font-medium">{i === 0 ? user.name : `Player ${i + 1}`}</p>
                        </div>
                        <p className="text-sm font-medium">{95 - i * 5}%</p>
                      </div>
                      <Progress value={95 - i * 5} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Team Achievements</CardTitle>
              <CardDescription>Titles and awards earned by your team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-start gap-4 p-4 rounded-lg border">
                  <Trophy className="h-10 w-10 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Team Champion 2024</h3>
                    <p className="text-sm text-muted-foreground">Winner of the Royal Rumble competition</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg border">
                  <Medal className="h-10 w-10 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Best Team Spirit</h3>
                    <p className="text-sm text-muted-foreground">Recognized for exceptional teamwork</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg border">
                  <Star className="h-10 w-10 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Most Improved Team</h3>
                    <p className="text-sm text-muted-foreground">Greatest improvement from 2023 to 2024</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-profile" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold">My Player Profile</h2>
              <p className="text-muted-foreground">View and manage your personal player information</p>
            </div>
            <Button asChild>
              <Link href="/player-profile">Full Profile</Link>
            </Button>
          </div>

          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Your Score</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">90</div>
                <p className="text-xs text-muted-foreground">+5 from last week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Rank</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">#1</div>
                <p className="text-xs text-muted-foreground">Mountain Goats</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Games Played</CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">9/10</div>
                <p className="text-xs text-muted-foreground">90% participation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accolades</CardTitle>
                <Medal className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-xs text-muted-foreground">Most on the team</p>
              </CardContent>
            </Card>
          </div>

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
                      src={`/placeholder.svg?height=64&width=64&text=${user.name.substring(0, 2)}`}
                      alt={user.name}
                    />
                    <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">Team: Mountain Goats • Role: Captain</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Proficiency Score</p>
                      <p className="text-lg font-medium">90/100</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Games Played</p>
                      <p className="text-lg font-medium">9/10</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Accolades</p>
                      <p className="text-lg font-medium">4</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Years Active</p>
                      <p className="text-lg font-medium">3</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Captain Feedback</CardTitle>
                <CardDescription>Feedback from other team captains</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[300px] overflow-y-auto">
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{["Basketball Tournament", "Soccer Match"][i]}</h3>
                        <Badge className="bg-green-100 text-green-800">Positive</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {
                          [
                            "Excellent leadership and team coordination.",
                            "Outstanding performance as both captain and player.",
                          ][i]
                        }
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          ["Team Leader", "MVP"],
                          ["Strategist", "Clutch Performer"],
                        ][i].map((accolade) => (
                          <Badge key={accolade} variant="outline" className="text-xs">
                            {accolade}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="my-proficiencies" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Proficiency Self-Assessment</CardTitle>
              <CardDescription>Your skills in different sports and activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Basketball</p>
                    <p className="text-sm font-medium">95/100</p>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Soccer</p>
                    <p className="text-sm font-medium">90/100</p>
                  </div>
                  <Progress value={90} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Volleyball</p>
                    <p className="text-sm font-medium">85/100</p>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Swimming</p>
                    <p className="text-sm font-medium">80/100</p>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Strategy Games</p>
                    <p className="text-sm font-medium">95/100</p>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Leadership</p>
                    <p className="text-sm font-medium">98/100</p>
                  </div>
                  <Progress value={98} className="h-2" />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-4">
                  Note: Proficiency self-assessment is only available before team assignment. Your current proficiencies
                  are locked as teams have already been formed.
                </p>
                <Button disabled>Edit Proficiencies</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accolades Earned</CardTitle>
              <CardDescription>Recognition for your performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-start gap-4 p-4 rounded-lg border">
                  <Trophy className="h-10 w-10 text-amber-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">MVP</h3>
                    <p className="text-sm text-muted-foreground">Basketball Tournament</p>
                    <p className="text-xs text-muted-foreground mt-1">Awarded by Admin</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg border">
                  <Crown className="h-10 w-10 text-purple-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Team Leader</h3>
                    <p className="text-sm text-muted-foreground">Season 2024</p>
                    <p className="text-xs text-muted-foreground mt-1">Awarded by Admin</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg border">
                  <Shield className="h-10 w-10 text-blue-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Defensive Wall</h3>
                    <p className="text-sm text-muted-foreground">Soccer Match</p>
                    <p className="text-xs text-muted-foreground mt-1">Awarded by Captain</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg border">
                  <Users className="h-10 w-10 text-green-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Team Player</h3>
                    <p className="text-sm text-muted-foreground">Volleyball Tournament</p>
                    <p className="text-xs text-muted-foreground mt-1">Awarded by Captain</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Auth Demo Component for testing different roles */}
      <AuthDemo />
    </div>
  )
}

function PlayerDashboard({ user }: { user: any }) {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 animate-in fade-in-50 duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Player Dashboard</h1>
          <p className="text-muted-foreground">Track your performance and team activities</p>
        </div>
      </div>

      <CompetitionTimeline />

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87</div>
            <p className="text-xs text-muted-foreground">+3 from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Rank</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#1</div>
            <p className="text-xs text-muted-foreground">Mountain Goats</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Games Played</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8/10</div>
            <p className="text-xs text-muted-foreground">80% participation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Game</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2 days</div>
            <p className="text-xs text-muted-foreground">vs Royal Rams</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="flex w-full overflow-x-auto">
          <TabsTrigger value="profile">My Profile</TabsTrigger>
          <TabsTrigger value="proficiencies">My Proficiencies</TabsTrigger>
          <TabsTrigger value="team">My Team</TabsTrigger>
          <TabsTrigger value="games">Games</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
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
                      src={`/placeholder.svg?height=64&width=64&text=${user.name.substring(0, 2)}`}
                      alt={user.name}
                    />
                    <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">Team: Mountain Goats</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Proficiency Score</p>
                      <p className="text-lg font-medium">87/100</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Games Played</p>
                      <p className="text-lg font-medium">8/10</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Accolades</p>
                      <p className="text-lg font-medium">3</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Years Active</p>
                      <p className="text-lg font-medium">2</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-semibold mb-2">About</h4>
                    <p className="text-sm text-muted-foreground">
                      Regular player with the Mountain Goats team. Specializes in team sports with a focus on basketball
                      and soccer.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Captain Feedback</CardTitle>
                <CardDescription>Feedback from your team captain</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[300px] overflow-y-auto">
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">
                          {["Basketball Tournament", "Soccer Match", "Volleyball Tournament"][i]}
                        </h3>
                        <Badge className="bg-green-100 text-green-800">Positive</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {
                          [
                            "Great defensive work and team coordination.",
                            "Excellent ball handling and passing skills.",
                            "Outstanding performance and leadership on the court.",
                          ][i]
                        }
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[["Defensive Wall", "Team Player"], ["Sharpshooter"], ["MVP", "Clutch Performer"]][i].map(
                          (accolade) => (
                            <Badge key={accolade} variant="outline" className="text-xs">
                              {accolade}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance History</CardTitle>
              <CardDescription>Your performance in recent games</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto">
              {/* Desktop view */}
              <div className="hidden md:block rounded-md border">
                <div className="grid grid-cols-5 p-4 font-medium">
                  <div>Game</div>
                  <div>Date</div>
                  <div>Score</div>
                  <div>Team Result</div>
                  <div>Feedback</div>
                </div>
                <div className="divide-y">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const isWon = i % 3 !== 1
                    return (
                      <div key={i} className="grid grid-cols-5 p-4 items-center">
                        <div className="text-sm font-medium">
                          {["Basketball", "Soccer", "Volleyball", "Relay Race", "Swimming"][i]} Game
                        </div>
                        <div className="text-sm">
                          {new Date(`2025-06-${15 - i}`).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-sm">{isWon ? "78-72" : "65-70"}</div>
                        <div className="text-sm">
                          <span className={isWon ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                            {isWon ? "Won" : "Lost"}
                          </span>
                        </div>
                        <div className="text-sm">
                          <Badge variant={i < 3 ? "default" : "outline"} className="text-xs">
                            {i < 3 ? "Positive" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Mobile view */}
              <div className="md:hidden space-y-4">
                {Array.from({ length: 5 }).map((_, i) => {
                  const isWon = i % 3 !== 1
                  return (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium">
                          {["Basketball", "Soccer", "Volleyball", "Relay Race", "Swimming"][i]} Game
                        </div>
                        <Badge variant={i < 3 ? "default" : "outline"} className="text-xs">
                          {i < 3 ? "Positive" : "Pending"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-y-2 mb-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Date</p>
                          <p className="text-sm">
                            {new Date(`2025-06-${15 - i}`).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Score</p>
                          <p className="text-sm">{isWon ? "78-72" : "65-70"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Result</p>
                          <p
                            className={
                              isWon ? "text-green-600 text-sm font-medium" : "text-red-600 text-sm font-medium"
                            }
                          >
                            {isWon ? "Won" : "Lost"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proficiencies" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Proficiency Self-Assessment</CardTitle>
              <CardDescription>Rate your skills in different sports and activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Basketball</p>
                    <p className="text-sm font-medium">90/100</p>
                  </div>
                  <Progress value={90} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Soccer</p>
                    <p className="text-sm font-medium">85/100</p>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Volleyball</p>
                    <p className="text-sm font-medium">75/100</p>
                  </div>

                  <Progress value={75} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Swimming</p>
                    <p className="text-sm font-medium">80/100</p>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Strategy Games</p>
                    <p className="text-sm font-medium">70/100</p>
                  </div>
                  <Progress value={70} className="h-2" />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-4">
                  Note: Proficiency self-assessment is only available before team assignment. Your current proficiencies
                  are locked as teams have already been formed.
                </p>
                <Button disabled>Edit Proficiencies</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accolades Earned</CardTitle>
              <CardDescription>Recognition for your performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-start gap-4 p-4 rounded-lg border">
                  <Trophy className="h-10 w-10 text-amber-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">MVP</h3>
                    <p className="text-sm text-muted-foreground">Volleyball Tournament</p>
                    <p className="text-xs text-muted-foreground mt-1">Awarded by Captain</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg border">
                  <Shield className="h-10 w-10 text-blue-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Defensive Wall</h3>
                    <p className="text-sm text-muted-foreground">Basketball Tournament</p>
                    <p className="text-xs text-muted-foreground mt-1">Awarded by Captain</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg border">
                  <Users className="h-10 w-10 text-green-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Team Player</h3>
                    <p className="text-sm text-muted-foreground">Soccer Match</p>
                    <p className="text-xs text-muted-foreground mt-1">Awarded by Captain</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Team Overview</CardTitle>
              <CardDescription>Information about your team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/placeholder.svg?height=64&width=64" alt="Team logo" />
                  <AvatarFallback>MG</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">Mountain Goats</h3>
                  <p className="text-sm text-muted-foreground">Captain: Sarah Johnson</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Team Score</p>
                    <p className="text-sm font-medium">1,245 / 1,500</p>
                  </div>
                  <Progress value={83} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Games Won</p>
                    <p className="text-sm font-medium">8 / 10</p>
                  </div>
                  <Progress value={80} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Team Rank</p>
                    <p className="text-sm font-medium">#1 of 8</p>
                  </div>
                  <Progress value={100} />
                </div>
              </div>

              <div className="pt-6 mt-6 border-t">
                <h4 className="text-sm font-semibold mb-3">Team Members</h4>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`/placeholder.svg?height=32&width=32&text=P${i + 1}`}
                          alt={i === 0 ? "Sarah Johnson" : `Player ${i + 1}`}
                        />
                        <AvatarFallback>{i === 0 ? "SJ" : `P${i + 1}`}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {i === 0 ? "Sarah Johnson (Captain)" : `Player ${i + 1}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Schedule</CardTitle>
              <CardDescription>Upcoming games for your team</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto">
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CalendarDays className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {["Basketball Tournament", "Soccer Match", "Volleyball Tournament", "Relay Race"][i]}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(`2025-06-${15 + i}`).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Mountain Goats</span>
                        </div>
                        <span className="text-sm text-muted-foreground">vs</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {["Royal Rams", "Athletic Antelopes", "Speed Sheep", "Team 5"][i]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="games" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Games</CardTitle>
              <CardDescription>Games you're scheduled to participate in</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto">
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">
                        {["Basketball Tournament", "Soccer Match", "Volleyball Tournament"][i]}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {i === 0 ? "In 2 days" : i === 1 ? "In 5 days" : "In 9 days"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {new Date(`2025-06-${15 + i * 3}`).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}{" "}
                      at {1 + i}:00 PM
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                      <div>
                        <span className="font-medium">Location:</span> {["Main Arena", "Field", "Court"][i]}
                      </div>
                      <div>
                        <span className="font-medium">Opponent:</span>{" "}
                        {["Royal Rams", "Athletic Antelopes", "Speed Sheep"][i]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Game Results</CardTitle>
              <CardDescription>Results from your recent games</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => {
                  const isWon = i % 3 !== 1
                  return (
                    <div key={i} className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">
                          {["Basketball", "Soccer", "Volleyball", "Relay Race", "Swimming"][i]} Game
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isWon ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                        >
                          {isWon ? "Won" : "Lost"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {new Date(`2025-06-${10 - i}`).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                        <div>
                          <span className="font-medium">Score:</span> {isWon ? "78-72" : "65-70"}
                        </div>
                        <div>
                          <span className="font-medium">Captain Feedback:</span>{" "}
                          <Badge variant={i < 3 ? "default" : "outline"} className="text-xs">
                            {i < 3 ? "Positive" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Auth Demo Component for testing different roles */}
      <AuthDemo />
    </div>
  )
}

// Loading state component
function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Skeleton className="h-10 w-full max-w-md" />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
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

