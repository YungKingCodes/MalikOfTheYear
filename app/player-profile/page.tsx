"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Star, Edit } from "lucide-react"
import { PlayerProficiencyChart } from "@/components/player-profile/proficiency-chart"
import { PlayerAchievements } from "@/components/player-profile/achievements"
import { PlayerFeedback } from "@/components/player-profile/feedback"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"

interface PlayerProfile {
  id: string
  name: string
  image: string | null
  teamName: string
  teamRole: string
  teamId: string | null
  proficiencyScore: number
  gamesPlayed: number
  yearsActive: number
  bio: string
  achievements: string[]
  teamRank: number
  teamScore: number
  teamMaxScore: number
  teamWins: number
  teamGames: number
}

export default function PlayerProfilePage() {
  const [profile, setProfile] = useState<PlayerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const { toast } = useToast()

  useEffect(() => {
    const loadProfile = async () => {
      if (!session?.user?.id) {
        return
      }
      
      try {
        setLoading(true)
        const response = await fetch(`/api/players/${session.user.id}/profile`)
        
        if (!response.ok) {
          throw new Error('Failed to load profile')
        }
        
        const data = await response.json()
        setProfile(data)
      } catch (error) {
        console.error("Failed to load profile:", error)
        toast({
          title: "Error",
          description: "Failed to load player profile. Please try again.",
          variant: "destructive",
        })
        
        // Fallback to mock data
        setProfile({
          id: session.user.id,
          name: session.user.name || "Unknown Player",
          image: session.user.image || null,
          teamName: "Your Team",
          teamRole: session.user.role === "captain" ? "Team Captain" : "Team Member",
          teamId: session.user.teamId || null,
          proficiencyScore: 85,
          gamesPlayed: 0,
          yearsActive: 1,
          bio: "No bio available.",
          achievements: [],
          teamRank: 0,
          teamScore: 0,
          teamMaxScore: 1500,
          teamWins: 0,
          teamGames: 0
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadProfile()
  }, [session, toast])

  if (loading || !profile) {
    return (
      <ProtectedRoute>
        <div className="container py-10 space-y-8 max-w-6xl mx-auto animate-pulse">
          <div className="bg-muted h-8 w-48 rounded"></div>
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="flex-1">
              <div className="border rounded-lg p-6 space-y-6">
                <div className="flex gap-4">
                  <div className="bg-muted h-20 w-20 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="bg-muted h-8 w-48 rounded"></div>
                    <div className="bg-muted h-4 w-32 rounded"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="bg-muted h-4 w-full rounded"></div>
                  <div className="bg-muted h-4 w-full rounded"></div>
                  <div className="bg-muted h-4 w-3/4 rounded"></div>
                </div>
              </div>
            </div>
            <div className="md:w-1/3">
              <div className="border rounded-lg p-6 space-y-6">
                <div className="bg-muted h-6 w-24 rounded"></div>
                <div className="space-y-4">
                  <div className="bg-muted h-12 rounded"></div>
                  <div className="bg-muted h-12 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
    <div className="container py-10 space-y-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold">Player Profile</h1>

      <div className="flex flex-col gap-8 md:flex-row">
        <div className="flex-1">
          <Card>
            <CardHeader className="flex flex-row items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage 
                  src={profile.image || `/placeholder.svg?height=80&width=80&text=${profile.name.substring(0, 2)}`} 
                  alt={`${profile.name}'s avatar`} 
                />
                <AvatarFallback>{profile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{profile.name}</CardTitle>
                    <CardDescription>{profile.teamName} • {profile.teamRole}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/player-profile/edit">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Proficiencies
                    </Link>
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {profile.achievements.map((achievement, index) => (
                    <Badge 
                      key={index} 
                      variant={index === 0 ? "secondary" : "outline"} 
                      className="flex items-center gap-1"
                    >
                      {index === 0 ? (
                        <Trophy className="h-3 w-3" />
                      ) : index === 1 ? (
                        <Medal className="h-3 w-3" />
                      ) : (
                        <Star className="h-3 w-3" />
                      )}
                      {achievement}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                    <span className="text-3xl font-bold">{profile.proficiencyScore}</span>
                    <span className="text-sm text-muted-foreground">Proficiency Score</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                    <span className="text-3xl font-bold">{profile.gamesPlayed}</span>
                    <span className="text-sm text-muted-foreground">Games Played</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                    <span className="text-3xl font-bold">{profile.yearsActive}</span>
                    <span className="text-sm text-muted-foreground">Years Active</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">About</h3>
                  <p className="text-sm text-muted-foreground">
                    {profile.bio}
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
                  <AvatarImage 
                    src={`/placeholder.svg?height=64&width=64&text=${profile.teamName.substring(0, 2)}`} 
                    alt="Team logo" 
                  />
                  <AvatarFallback>{profile.teamName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{profile.teamName}</h3>
                  <p className="text-sm text-muted-foreground">Current Season</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Team Rank</p>
                    <p className="text-sm font-medium">#{profile.teamRank || "-"}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Team Score</p>
                    <p className="text-sm font-medium">{profile.teamScore.toLocaleString()} / {profile.teamMaxScore.toLocaleString()}</p>
                  </div>
                  <Progress value={(profile.teamScore / profile.teamMaxScore) * 100} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Games Won</p>
                    <p className="text-sm font-medium">{profile.teamWins} / {profile.teamGames}</p>
                  </div>
                  <Progress value={profile.teamGames > 0 ? (profile.teamWins / profile.teamGames) * 100 : 0} />
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
                    {/* Replace with dynamic data when available */}
                    <div className="grid grid-cols-5 p-4">
                      <div className="font-medium">2025</div>
                      <div>Current Competition</div>
                      <div>{profile.teamName}</div>
                      <div>{profile.teamRole}</div>
                      <div>In Progress</div>
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

