import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Trophy, Users, ArrowLeft, Crown, Medal, Star, Award, TrendingUp } from "lucide-react"
import { getCompetitions, getTeams, getGames } from "@/lib/data"
import { TeamColorSelector } from "@/components/team-color-selector"

export async function generateMetadata({ params }: { params: { year: string } }): Promise<Metadata> {
  return {
    title: `${params.year} Competition | Malik of The Year`,
    description: `Details for the ${params.year} Malik of The Year competition`,
  }
}

export default async function CompetitionDetailPage({ params }: { params: { year: string } }) {
  const year = Number.parseInt(params.year)

  // Fetch competition data
  const competitions = await getCompetitions({ year })
  const competition = competitions[0] || null

  // Fetch teams for this competition
  const teams = await getTeams(competition?._id)

  // Fetch games for this competition
  const games = await getGames({ competitionId: competition?._id })

  if (!competition) {
    return (
      <div className="container py-12 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/competitions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Competitions
            </Link>
          </Button>
        </div>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Competition Not Found</h1>
          <p className="text-muted-foreground">The competition for year {year} could not be found.</p>
        </div>
      </div>
    )
  }

  const startDate = new Date(competition.startDate)
  const endDate = new Date(competition.endDate)
  const isActive = competition.status === "active"

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/competitions">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Competitions
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1 space-y-6">
          <div>
            <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : "Completed"}</Badge>
            <h1 className="text-3xl font-bold mt-2">
              {competition.name} {competition.year}
            </h1>
            <p className="text-muted-foreground mt-2">{competition.description}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <Calendar className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium">Competition Dates</p>
                  <p className="text-sm text-muted-foreground">
                    {startDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })} -{" "}
                    {endDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <Trophy className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium">{isActive ? "Top Prize" : "Winner"}</p>
                  <p className="text-sm text-muted-foreground">
                    {isActive
                      ? '"The GOAT" Trophy'
                      : competition.winner === "team1"
                        ? "Mountain Goats"
                        : competition.winner === "team2"
                          ? "Royal Rams"
                          : "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-medium">Teams & Players</p>
                  <p className="text-sm text-muted-foreground">
                    {teams.length} Teams, {teams.length * 8} Players
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {!isActive && (
          <Card className="md:w-80">
            <CardHeader>
              <CardTitle>Competition Results</CardTitle>
              <CardDescription>Final results and awards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span className="font-medium">Winning Team</span>
                </div>
                <div className="flex items-center gap-3 pl-7">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={`/placeholder.svg?height=32&width=32&text=${competition.winner === "team1" ? "MG" : "RR"}`}
                      alt={competition.winner === "team1" ? "Mountain Goats" : "Royal Rams"}
                    />
                    <AvatarFallback>{competition.winner === "team1" ? "MG" : "RR"}</AvatarFallback>
                  </Avatar>
                  <span>{competition.winner === "team1" ? "Mountain Goats" : "Royal Rams"}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  <span className="font-medium">The GOAT</span>
                </div>
                <div className="flex items-center gap-3 pl-7">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={`/placeholder.svg?height=32&width=32&text=${competition.goat === "user1" ? "SJ" : "MC"}`}
                      alt={competition.goat === "user1" ? "Sarah Johnson" : "Michael Chen"}
                    />
                    <AvatarFallback>{competition.goat === "user1" ? "SJ" : "MC"}</AvatarFallback>
                  </Avatar>
                  <span>{competition.goat === "user1" ? "Sarah Johnson" : "Michael Chen"}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Medal className="h-5 w-5 text-primary" />
                  <span className="font-medium">MVP</span>
                </div>
                <div className="flex items-center gap-3 pl-7">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32&text=ER" alt="Emily Rodriguez" />
                    <AvatarFallback>ER</AvatarFallback>
                  </Avatar>
                  <span>Emily Rodriguez</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  <span className="font-medium">Rookie of the Year</span>
                </div>
                <div className="flex items-center gap-3 pl-7">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32&text=DK" alt="David Kim" />
                    <AvatarFallback>DK</AvatarFallback>
                  </Avatar>
                  <span>David Kim</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="teams" className="space-y-4">
        <TabsList>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="titles">Titles</TabsTrigger>
          {!isActive && <TabsTrigger value="awards">Awards</TabsTrigger>}
        </TabsList>

        <TabsContent value="teams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Participating Teams</CardTitle>
              <CardDescription>
                Teams competing in the {competition.year} {competition.name} competition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="rounded-md border">
                  <div className="grid grid-cols-6 p-4 font-medium">
                    <div>Team</div>
                    <div>Captain</div>
                    <div>Members</div>
                    <div>Score</div>
                    <div>Rank</div>
                    <div>Color</div>
                  </div>
                  <div className="divide-y">
                    {teams.map((team, i) => (
                      <div key={team._id} className="grid grid-cols-6 p-4 items-center">
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
                        <div className="text-sm">
                          {team._id === "team1"
                            ? "Sarah Johnson"
                            : team._id === "team2"
                              ? "Michael Chen"
                              : team._id === "team3"
                                ? "James Wilson"
                                : "Emily Rodriguez"}
                        </div>
                        <div className="text-sm">{team.members.length}/8</div>
                        <div className="text-sm">{team.score}</div>
                        <div>
                          <Badge variant={i < 3 ? "default" : "outline"} className="text-xs">
                            #{i + 1}
                          </Badge>
                        </div>
                        <div>
                          <div
                            className={`w-6 h-6 rounded-full ${
                              team._id === "team1"
                                ? "bg-red-500"
                                : team._id === "team2"
                                  ? "bg-blue-500"
                                  : team._id === "team3"
                                    ? "bg-green-500"
                                    : team._id === "team4"
                                      ? "bg-yellow-500"
                                      : "bg-gray-500"
                            }`}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {isActive && <TeamColorSelector competitionId={competition._id} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="games" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Competition Games</CardTitle>
              <CardDescription>
                Games selected for the {competition.year} {competition.name} competition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 p-4 font-medium">
                    <div>Game</div>
                    <div>Type</div>
                    <div>Status</div>
                    <div>Points Value</div>
                    <div>Location</div>
                  </div>
                  <div className="divide-y">
                    {games.map((game, i) => (
                      <div key={game._id} className="grid grid-cols-5 p-4 items-center">
                        <div className="text-sm font-medium">{game.name}</div>
                        <div className="text-sm">{game.type}</div>
                        <div>
                          <Badge
                            variant={
                              game.status === "completed"
                                ? "success"
                                : game.status === "scheduled"
                                  ? "default"
                                  : "outline"
                            }
                            className="text-xs"
                          >
                            {game.status === "completed"
                              ? "Completed"
                              : game.status === "scheduled"
                                ? "Scheduled"
                                : "Pending"}
                          </Badge>
                        </div>
                        <div className="text-sm">{game.pointsValue || ((i % 3) + 1) * 100} pts</div>
                        <div className="text-sm">{game.location || "Main Arena"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Competition Schedule</CardTitle>
              <CardDescription>
                Schedule for the {competition.year} {competition.name} competition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 p-4 font-medium">
                    <div>Date</div>
                    <div>Time</div>
                    <div>Game</div>
                    <div>Teams</div>
                    <div>Location</div>
                  </div>
                  <div className="divide-y">
                    {games
                      .filter((game) => game.status === "scheduled" || game.status === "completed")
                      .sort((a, b) => new Date(a.date || "").getTime() - new Date(b.date || "").getTime())
                      .map((game, i) => {
                        const gameDate = game.date ? new Date(game.date) : new Date(`2025-06-${15 + i}`)

                        return (
                          <div key={game._id} className="grid grid-cols-5 p-4 items-center">
                            <div className="text-sm">
                              {gameDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                            </div>
                            <div className="text-sm">{`${1 + (i % 3)}:00 PM`}</div>
                            <div className="text-sm font-medium">{game.name}</div>
                            <div className="text-sm">
                              {game.team1 === "team1"
                                ? "Mountain Goats"
                                : game.team1 === "team2"
                                  ? "Royal Rams"
                                  : game.team1 === "team3"
                                    ? "Athletic Antelopes"
                                    : game.team1 === "team4"
                                      ? "Speed Sheep"
                                      : `Team ${(i % 8) + 1}`}
                              {" vs "}
                              {game.team2 === "team1"
                                ? "Mountain Goats"
                                : game.team2 === "team2"
                                  ? "Royal Rams"
                                  : game.team2 === "team3"
                                    ? "Athletic Antelopes"
                                    : game.team2 === "team4"
                                      ? "Speed Sheep"
                                      : `Team ${((i + 4) % 8) + 1}`}
                            </div>
                            <div className="text-sm">{game.location || "Main Arena"}</div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="titles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Titles</CardTitle>
              <CardDescription>
                Titles and trophies that can be earned in the {competition.year} {competition.name} competition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">The GOAT</CardTitle>
                      <Crown className="h-5 w-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      The highest honor awarded to the most valuable player of the entire competition.
                    </p>
                    <div className="mt-2 p-2 bg-muted rounded-md">
                      <p className="text-xs font-medium">Requirements:</p>
                      <ul className="text-xs mt-1 space-y-1 text-muted-foreground">
                        <li>• Highest overall contribution to team success</li>
                        <li>• Exceptional performance across multiple games</li>
                        <li>• Demonstrated leadership qualities</li>
                        <li>• Selected by competition committee</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">MVP</CardTitle>
                      <Medal className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Awarded to the most valuable player on a team. Recognizes exceptional individual performance.
                    </p>
                    <div className="mt-2 p-2 bg-muted rounded-md">
                      <p className="text-xs font-medium">Requirements:</p>
                      <ul className="text-xs mt-1 space-y-1 text-muted-foreground">
                        <li>• Highest proficiency score on team</li>
                        <li>• Participated in at least 80% of team games</li>
                        <li>• Significant contribution to team's success</li>
                        <li>• Nominated by team captain, confirmed by committee</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">Rookie of the Year</CardTitle>
                      <Star className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Awarded to the best performing first-time participant. Recognizes exceptional talent in new
                      competitors.
                    </p>
                    <div className="mt-2 p-2 bg-muted rounded-md">
                      <p className="text-xs font-medium">Requirements:</p>
                      <ul className="text-xs mt-1 space-y-1 text-muted-foreground">
                        <li>• First year participating in the competition</li>
                        <li>• Top 3 proficiency score among all rookies</li>
                        <li>• Participated in at least 70% of team games</li>
                        <li>• Selected by competition committee</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">Team Champion</CardTitle>
                      <Trophy className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Awarded to all members of the winning team. Recognizes collective excellence and teamwork.
                    </p>
                    <div className="mt-2 p-2 bg-muted rounded-md">
                      <p className="text-xs font-medium">Requirements:</p>
                      <ul className="text-xs mt-1 space-y-1 text-muted-foreground">
                        <li>• Highest team score at the end of competition</li>
                        <li>• Must have participated in at least 90% of scheduled games</li>
                        <li>• All team members receive this title</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">Game Master</CardTitle>
                      <Award className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Awarded to players who excel in specific game categories. Multiple players can earn this title.
                    </p>
                    <div className="mt-2 p-2 bg-muted rounded-md">
                      <p className="text-xs font-medium">Requirements:</p>
                      <ul className="text-xs mt-1 space-y-1 text-muted-foreground">
                        <li>• Highest score in a specific game category</li>
                        <li>• Must participate in all games of that category</li>
                        <li>• Categories: Team Sports, Individual, Strategy, Relay</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">Most Improved</CardTitle>
                      <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Recognizes the player who shows the most significant improvement in proficiency score compared to
                      previous competitions.
                    </p>
                    <div className="mt-2 p-2 bg-muted rounded-md">
                      <p className="text-xs font-medium">Requirements:</p>
                      <ul className="text-xs mt-1 space-y-1 text-muted-foreground">
                        <li>• Must have participated in at least one previous competition</li>
                        <li>• Largest percentage increase in proficiency score</li>
                        <li>• Minimum 10% improvement required</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {!isActive && (
          <TabsContent value="awards" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Competition Awards</CardTitle>
                <CardDescription>
                  Awards and titles from the {competition.year} {competition.name} competition
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">The GOAT</CardTitle>
                        <Crown className="h-5 w-5 text-primary" />
                      </div>
                      <CardDescription>Highest Individual Honor</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3 mt-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={`/placeholder.svg?height=40&width=40&text=${competition.goat === "user1" ? "SJ" : "MC"}`}
                            alt={competition.goat === "user1" ? "Sarah Johnson" : "Michael Chen"}
                          />
                          <AvatarFallback>{competition.goat === "user1" ? "SJ" : "MC"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {competition.goat === "user1" ? "Sarah Johnson" : "Michael Chen"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {competition.goat === "user1" ? "Mountain Goats" : "Royal Rams"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">MVP</CardTitle>
                        <Medal className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <CardDescription>Most Valuable Player</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3 mt-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="/placeholder.svg?height=40&width=40&text=ER" alt="Emily Rodriguez" />
                          <AvatarFallback>ER</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Emily Rodriguez</p>
                          <p className="text-xs text-muted-foreground">Speed Sheep</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">Rookie of the Year</CardTitle>
                        <Star className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <CardDescription>Best New Player</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3 mt-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="/placeholder.svg?height=40&width=40&text=DK" alt="David Kim" />
                          <AvatarFallback>DK</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">David Kim</p>
                          <p className="text-xs text-muted-foreground">Royal Rams</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

