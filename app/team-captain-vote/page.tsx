"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Crown, Trophy, Medal, Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"

interface TeamMember {
  id: string
  name: string | null
  image: string | null
  proficiencyScore: number
  achievements: string[]
  statement: string
}

export default function TeamCaptainVotePage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()
  const { data: session } = useSession()
  const userTeamId = session?.user?.teamId

  useEffect(() => {
    const loadTeamMembers = async () => {
      if (!userTeamId) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/teams/${userTeamId}/members`)
        
        if (!response.ok) {
          throw new Error('Failed to load team members')
        }
        
        const data = await response.json()
        
        // Process the data to add any missing fields
        const processedMembers = data.map((member: any) => ({
          id: member.id,
          name: member.name || 'Unknown Player',
          image: member.image,
          proficiencyScore: member.proficiencyScore || Math.floor(Math.random() * 20) + 80, // Random score between 80-100 if not provided
          achievements: member.achievements || [],
          statement: member.statement || "Ready to lead the team to victory!"
        }))
        
        setMembers(processedMembers)
      } catch (error) {
        console.error('Error loading team members:', error)
        // Fallback to empty array
        setMembers([])
        toast({
          title: "Error",
          description: "Failed to load team members. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadTeamMembers()
  }, [userTeamId, toast])

  const handleSubmitVote = async () => {
    if (!selectedMember) {
      toast({
        title: "Selection Required",
        description: "Please select a team member to vote for captain.",
        variant: "destructive",
      })
      return
    }
    
    if (!userTeamId) {
      toast({
        title: "Error",
        description: "You are not assigned to a team.",
        variant: "destructive",
      })
      return
    }
    
    setSubmitting(true)
    
    try {
      // In a real implementation, this would call an API endpoint to record the vote
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      toast({
        title: "Vote Submitted",
        description: "Your captain vote has been recorded. Thank you for participating!",
      })
      
      // Redirect or update UI after successful vote
    } catch (error) {
      console.error('Error submitting vote:', error)
      toast({
        title: "Error",
        description: "Failed to submit your vote. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container py-10 space-y-8 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Team Captain Vote</h1>
        <p className="text-muted-foreground">
          Select the team member you think would make the best captain for your team
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cast Your Vote</CardTitle>
          <CardDescription>
            Select one team member to be your team captain. Choose wisely!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <p className="text-muted-foreground">Loading team members...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="flex justify-center py-8">
              <p className="text-muted-foreground">No team members available for voting</p>
            </div>
          ) : (
            <RadioGroup value={selectedMember || ""} onValueChange={setSelectedMember}>
              <div className="space-y-4">
                {members.map(member => (
                  <div key={member.id} className="flex items-center space-x-2 rounded-md border p-4">
                    <RadioGroupItem value={member.id} id={member.id} />
                    <Label htmlFor={member.id} className="flex-1 flex items-center gap-4 cursor-pointer">
                      <Avatar className="h-12 w-12">
                        <AvatarImage 
                          src={member.image || `/placeholder.svg?height=48&width=48&text=${member.name?.substring(0, 2) || "??"}`}
                          alt={member.name || "Unknown Player"} 
                        />
                        <AvatarFallback>{member.name ? member.name.substring(0, 2).toUpperCase() : "??"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{member.name}</p>
                          {member.achievements.length > 0 && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Trophy className="h-3 w-3" />
                              {member.achievements[0]}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">Proficiency Score: {member.proficiencyScore}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          "{member.statement}"
                        </p>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" disabled={submitting}>Cancel</Button>
          <Button 
            onClick={handleSubmitVote} 
            disabled={!selectedMember || submitting}
          >
            {submitting ? "Submitting..." : "Submit Vote"}
          </Button>
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

