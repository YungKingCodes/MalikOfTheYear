import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Crown, Trophy, Medal, Star } from "lucide-react"

export const metadata: Metadata = {
  title: "Team Captain Vote | Malik of The Year",
  description: "Vote for your team captain in the Malik of The Year competition",
}

export default function TeamCaptainVotePage() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Team Captain Vote</h1>
          <p className="text-muted-foreground">Cast your vote for the Mountain Goats team captain</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Crown className="h-3 w-3" />
            Voting ends in 2 days
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Your Team Captain</CardTitle>
          <CardDescription>
            Choose the player you believe will best lead the Mountain Goats in the 2025 Eid-Al-Athletes competition.
            Your vote is confidential and you can only vote once.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup defaultValue="player1">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 rounded-md border p-4">
                <RadioGroupItem value="player1" id="player1" />
                <Label htmlFor="player1" className="flex-1 flex items-center gap-4 cursor-pointer">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder.svg?height=48&width=48&text=SJ" alt="Sarah Johnson" />
                    <AvatarFallback>SJ</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">Sarah Johnson</p>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Trophy className="h-3 w-3" />
                        GOAT '24
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Proficiency Score: 98</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      "I'll lead our team to victory with strategic planning and team-building."
                    </p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 rounded-md border p-4">
                <RadioGroupItem value="player2" id="player2" />
                <Label htmlFor="player2" className="flex-1 flex items-center gap-4 cursor-pointer">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder.svg?height=48&width=48&text=ER" alt="Emily Rodriguez" />
                    <AvatarFallback>ER</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">Emily Rodriguez</p>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Medal className="h-3 w-3" />
                        MVP '24
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Proficiency Score: 94</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      "My focus on individual strengths will help us maximize our team potential."
                    </p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 rounded-md border p-4">
                <RadioGroupItem value="player3" id="player3" />
                <Label htmlFor="player3" className="flex-1 flex items-center gap-4 cursor-pointer">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder.svg?height=48&width=48&text=JW" alt="James Wilson" />
                    <AvatarFallback>JW</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">James Wilson</p>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Rookie '24
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Proficiency Score: 92</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      "Fresh perspective and innovative strategies will give us the edge we need."
                    </p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 rounded-md border p-4">
                <RadioGroupItem value="player4" id="player4" />
                <Label htmlFor="player4" className="flex-1 flex items-center gap-4 cursor-pointer">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder.svg?height=48&width=48&text=DK" alt="David Kim" />
                    <AvatarFallback>DK</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">David Kim</p>
                    </div>
                    <p className="text-xs text-muted-foreground">Proficiency Score: 90</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      "My analytical approach will help us identify and exploit our opponents' weaknesses."
                    </p>
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel</Button>
          <Button>Submit Vote</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Voting Rules</CardTitle>
          <CardDescription>Important information about the team captain voting process</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="rounded-full bg-primary/10 p-1 text-primary">
                <Crown className="h-4 w-4" />
              </span>
              <span>Each team member gets one vote for their team captain.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="rounded-full bg-primary/10 p-1 text-primary">
                <Crown className="h-4 w-4" />
              </span>
              <span>Votes are confidential and cannot be changed once submitted.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="rounded-full bg-primary/10 p-1 text-primary">
                <Crown className="h-4 w-4" />
              </span>
              <span>The player with the most votes will be appointed team captain.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="rounded-full bg-primary/10 p-1 text-primary">
                <Crown className="h-4 w-4" />
              </span>
              <span>In case of a tie, the player with the highest proficiency score will be appointed.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="rounded-full bg-primary/10 p-1 text-primary">
                <Crown className="h-4 w-4" />
              </span>
              <span>Voting closes in 2 days, and results will be announced immediately after.</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

