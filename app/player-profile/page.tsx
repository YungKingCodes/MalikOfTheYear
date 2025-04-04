import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Medal, Star, Edit } from "lucide-react"
import Link from "next/link"
import { PlayerProficiencyChart } from "@/components/player-profile/proficiency-chart"
import { PlayerAchievements } from "@/components/player-profile/achievements"
import { PlayerFeedback } from "@/components/player-profile/feedback"
import { ProtectedRoute } from "@/components/protected-route"

export const metadata: Metadata = {
  title: "Player Profile | Malik of The Year",
  description: "Player profile for Malik of The Year competition",
}

export default function PlayerProfilePage() {
  return (
    <ProtectedRoute>
    <div className="flex flex-col gap-8 p-4 md:p-8 animate-in fade-in-50 duration-500">
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="flex-1">
          <Card>
            <CardHeader className="flex flex-row items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Player avatar" />
                <AvatarFallback>SJ</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Sarah Johnson</CardTitle>
                    <CardDescription>Mountain Goats • Team Captain</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/player-profile/edit">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Proficiencies
                    </Link>
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    GOAT '24
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Medal className="h-3 w-3" />
                    MVP '23
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Rookie '22
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                    <span className="text-3xl font-bold">98</span>
                    <span className="text-sm text-muted-foreground">Proficiency Score</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                    <span className="text-3xl font-bold">24</span>
                    <span className="text-sm text-muted-foreground">Games Played</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                    <span className="text-3xl font-bold">3</span>
                    <span className="text-sm text-muted-foreground">Years Active</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">About</h3>
                  <p className="text-sm text-muted-foreground">
                    Sarah is a competitive athlete with a background in multiple sports. She has been participating in
                    Malik of The Year competitions since 2022 and has earned several titles, including "The GOAT" in
                    2024. She currently serves as the captain of the Mountain Goats team.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Team</CardTitle>
              <CardDescription>Current team information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/placeholder.svg?height=64&width=64" alt="Team logo" />
                  <AvatarFallback>MG</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">Mountain Goats</h3>
                  <p className="text-sm text-muted-foreground">2025 Season</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Team Rank</p>
                    <p className="text-sm font-medium">#1</p>
                  </div>
                </div>

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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="proficiencies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="proficiencies">Proficiencies</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="feedback">Captain Feedback</TabsTrigger>
          <TabsTrigger value="history">Competition History</TabsTrigger>
        </TabsList>

        <TabsContent value="proficiencies" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Player Proficiencies</CardTitle>
              <CardDescription>Skills and abilities that contribute to the player's overall score</CardDescription>
            </CardHeader>
            <CardContent>
              <PlayerProficiencyChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <PlayerAchievements />
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <PlayerFeedback />
        </TabsContent>

        <TabsContent value="history" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <Card>
            <CardHeader>
              <CardTitle>Competition History</CardTitle>
              <CardDescription>Past competitions and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 p-4 font-medium">
                    <div>Year</div>
                    <div>Competition</div>
                    <div>Team</div>
                    <div>Role</div>
                    <div>Result</div>
                  </div>
                  <div className="divide-y">
                    <div className="grid grid-cols-5 p-4">
                      <div className="font-medium">2025</div>
                      <div>Eid-Al-Athletes</div>
                      <div>Mountain Goats</div>
                      <div>Captain</div>
                      <div>In Progress</div>
                    </div>
                    <div className="grid grid-cols-5 p-4">
                      <div className="font-medium">2024</div>
                      <div>Royal Rumble</div>
                      <div>Mountain Goats</div>
                      <div>Captain</div>
                      <div className="text-primary font-medium">Winner (GOAT)</div>
                    </div>
                    <div className="grid grid-cols-5 p-4">
                      <div className="font-medium">2023</div>
                      <div>Desert Kings</div>
                      <div>Sand Scorpions</div>
                      <div>Member</div>
                      <div>Runner-up</div>
                    </div>
                    <div className="grid grid-cols-5 p-4">
                      <div className="font-medium">2022</div>
                      <div>Jungle Monarchs</div>
                      <div>Forest Felines</div>
                      <div>Member</div>
                      <div>3rd Place</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </ProtectedRoute>
  )
}

