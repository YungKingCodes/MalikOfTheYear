"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, CheckCircle, Clock, Target, Crown, UserPlus } from "lucide-react"
import { useState, useEffect } from "react"
import { getCompetitionTimeline } from "@/app/actions/dashboard-stats"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import { Loader2, Sparkles, Users } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface TimelinePhase {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  status: string
  progress: number
  order: number
  type: string
}

interface CompetitionTimelineData {
  competitionId: string
  competitionName: string
  competitionYear: number
  status: string
  phases: TimelinePhase[]
}

interface Competition {
  id: string
  name: string
  year: number
  status: string
}

// Define scoring categories
const scoringCategories = [
  { id: "dexterity", name: "Dexterity", description: "Ability to perform precise movements" },
  { id: "athleticism", name: "Athleticism", description: "Overall athletic ability" },
  { id: "strength", name: "Strength", description: "Physical power" },
  { id: "balance", name: "Balance", description: "Ability to maintain body equilibrium" },
  { id: "endurance", name: "Endurance", description: "Stamina and ability to sustain effort" },
  { id: "speed", name: "Speed", description: "Quickness of movement" },
  { id: "memory", name: "Memory", description: "Ability to recall information" },
  { id: "strategy", name: "Strategy", description: "Ability to plan and execute game plans" },
  { id: "focus", name: "Focus", description: "Ability to concentrate during activities" },
  { id: "readingComprehension", name: "Reading Comprehension", description: "Ability to understand written information" },
  { id: "accuracy", name: "Accuracy", description: "Precision in targeting" },
  { id: "handEyeCoordination", name: "Hand-Eye Coordination", description: "Coordination between visual input and manual movement" },
  { id: "reflexes", name: "Reflexes", description: "Speed of reaction to stimuli" },
  { id: "generalIQ", name: "General IQ", description: "Overall cognitive ability" }
];

// Player scoring button component
function PlayerScoringButton({ phaseId }: { phaseId: string }) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("self")
  const [players, setPlayers] = useState<any[]>([])
  const [selfScores, setSelfScores] = useState<Record<string, number>>({})
  const [otherScores, setOtherScores] = useState<Record<string, Record<string, number>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [playersLoading, setPlayersLoading] = useState(false)
  
  // Initialize scores for all categories
  useEffect(() => {
    const initialScores: Record<string, number> = {};
    scoringCategories.forEach(category => {
      initialScores[category.id] = 3; // Default to middle value (3 out of 5)
    });
    setSelfScores(initialScores);
  }, []);
  
  // Fetch all players when opened
  useEffect(() => {
    async function fetchPlayers() {
      if (open && activeTab === "others") {
        try {
          setPlayersLoading(true);
          const response = await fetch('/api/players', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) throw new Error('Failed to fetch players');
          
          const data = await response.json();
          setPlayers(data.players || []);
          
          // Initialize scores for all players
          const initialPlayerScores: Record<string, Record<string, number>> = {};
          if (data.players && data.players.length > 0) {
            data.players.forEach((player: any) => {
              initialPlayerScores[player.id] = {};
              scoringCategories.forEach(category => {
                initialPlayerScores[player.id][category.id] = 3; // Default to middle value (3 out of 5)
              });
            });
          }
          setOtherScores(initialPlayerScores);
        } catch (error) {
          console.error('Error fetching players:', error);
        } finally {
          setPlayersLoading(false);
        }
      }
    }
    
    fetchPlayers();
  }, [open, activeTab]);
  
  const handleSelfScoreChange = (categoryId: string, value: number[]) => {
    setSelfScores(prev => ({
      ...prev,
      [categoryId]: value[0]
    }));
  };
  
  const handleOtherScoreChange = (playerId: string, categoryId: string, value: number[]) => {
    setOtherScores(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [categoryId]: value[0]
      }
    }));
  };
  
  const submitSelfScores = async () => {
    setIsSubmitting(true);
    setStatus('loading');
    
    try {
      const response = await fetch('/api/player-score/self', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phaseId,
          scores: selfScores
        }),
      });
      
      if (!response.ok) throw new Error('Failed to submit self scores');
      
      setStatus('success');
      setTimeout(() => setOpen(false), 1500);
    } catch (error) {
      console.error('Error submitting self scores:', error);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const submitOtherScores = async () => {
    setIsSubmitting(true);
    setStatus('loading');
    
    try {
      const response = await fetch('/api/player-score/others', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phaseId,
          scores: otherScores
        }),
      });
      
      if (!response.ok) throw new Error('Failed to submit other player scores');
      
      setStatus('success');
      setTimeout(() => setOpen(false), 1500);
    } catch (error) {
      console.error('Error submitting other player scores:', error);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Function that gets the score for player's category
  const getPlayerCategoryScore = (playerId: string, categoryId: string): number => {
    return otherScores[playerId]?.[categoryId] || 3;
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5" />
          <span>Score Players</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Player Scoring</DialogTitle>
          <DialogDescription>
            Rate players based on different skill categories from 1 to 5
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="self" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="self">Score Yourself</TabsTrigger>
            <TabsTrigger value="others">Score Others</TabsTrigger>
          </TabsList>
          
          <TabsContent value="self" className="space-y-4 mt-4">
            <div className="text-sm text-muted-foreground mb-4">
              Rate yourself on the following categories from 1 (lowest) to 5 (highest). Be honest in your assessments.
            </div>
            
            <div className="space-y-6">
              {scoringCategories.map(category => (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{category.name}</h4>
                      <p className="text-xs text-muted-foreground">{category.description}</p>
                    </div>
                    <span className="text-sm font-medium">{selfScores[category.id] || 3}/5</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">1</span>
                    <Slider
                      value={[selfScores[category.id] || 3]}
                      min={1}
                      max={5}
                      step={1}
                      onValueChange={(value) => handleSelfScoreChange(category.id, value)}
                    />
                    <span className="text-xs text-muted-foreground">5</span>
                  </div>
                </div>
              ))}
            </div>
            
            <DialogFooter className="pt-4">
              <Button 
                onClick={submitSelfScores} 
                disabled={isSubmitting}
                className="w-full"
              >
                {status === 'loading' ? 'Submitting...' : 
                 status === 'success' ? 'Submitted!' : 
                 status === 'error' ? 'Try Again' : 'Submit Self Scores'}
              </Button>
            </DialogFooter>
          </TabsContent>
          
          <TabsContent value="others" className="mt-4">
            <div className="text-sm text-muted-foreground mb-4">
              Rate other players on the following categories from 1 (lowest) to 5 (highest). Be fair and objective in your assessments.
            </div>
            
            {playersLoading ? (
              <div className="py-8 text-center text-muted-foreground">
                Loading players...
              </div>
            ) : players.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No other players available to rate.
              </div>
            ) : (
              <div className="space-y-8">
                {players.map(player => (
                  <div key={player.id} className="border rounded-lg p-4">
                    <h3 className="font-medium text-lg mb-4">{player.name}</h3>
                    
                    <div className="space-y-6">
                      {scoringCategories.map(category => (
                        <div key={`${player.id}-${category.id}`} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{category.name}</h4>
                              <p className="text-xs text-muted-foreground">{category.description}</p>
                            </div>
                            <span className="text-sm font-medium">
                              {getPlayerCategoryScore(player.id, category.id)}/5
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">1</span>
                            <Slider
                              value={[getPlayerCategoryScore(player.id, category.id)]}
                              min={1}
                              max={5}
                              step={1}
                              onValueChange={(value) => handleOtherScoreChange(player.id, category.id, value)}
                            />
                            <span className="text-xs text-muted-foreground">5</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <DialogFooter className="pt-6">
              <Button 
                onClick={submitOtherScores} 
                disabled={isSubmitting || players.length === 0}
                className="w-full"
              >
                {status === 'loading' ? 'Submitting...' : 
                 status === 'success' ? 'Submitted!' : 
                 status === 'error' ? 'Try Again' : 'Submit All Ratings'}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Captain voting button component
function CaptainVotingButton({ phaseId }: { phaseId: string }) {
  const [open, setOpen] = useState(false)
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [selectedCaptainId, setSelectedCaptainId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<string>('idle')
  const [userTeam, setUserTeam] = useState<any>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [votedCaptain, setVotedCaptain] = useState<any>(null)
  
  // Fetch team data when dialog opens
  useEffect(() => {
    async function fetchTeamData() {
      if (open) {
        setStatus('loading');
        try {
          // First get the current user's team
          const teamResponse = await fetch('/api/users/me/team', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          
          if (!teamResponse.ok) {
            throw new Error('Failed to fetch team data');
          }
          
          const teamData = await teamResponse.json();
          
          if (!teamData.team) {
            setStatus('error');
            return;
          }
          
          setUserTeam(teamData.team);
          
          // Then fetch team members
          const membersResponse = await fetch(`/api/teams/${teamData.team.id}/members`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          
          if (!membersResponse.ok) {
            throw new Error('Failed to fetch team members');
          }
          
          const membersData = await membersResponse.json();
          setTeamMembers(membersData.members || []);
          
          // Check if user has already voted
          const votingResponse = await fetch(`/api/captain-voting/${phaseId}/my-vote`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          
          if (votingResponse.ok) {
            const votingData = await votingResponse.json();
            if (votingData.vote) {
              setHasVoted(true);
              setVotedCaptain(membersData.members.find((m: any) => m.id === votingData.vote.captainId));
            }
          }
          
          setStatus('idle');
        } catch (error) {
          console.error('Error fetching team data:', error);
          setStatus('error');
        }
      }
    }
    
    fetchTeamData();
  }, [open, phaseId]);
  
  const handleVoteSubmit = async () => {
    if (!selectedCaptainId) return;
    
    setIsSubmitting(true);
    setStatus('loading');
    
    try {
      const response = await fetch('/api/captain-voting/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phaseId,
          captainId: selectedCaptainId,
          teamId: userTeam.id
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit captain vote');
      }
      
      setStatus('success');
      setHasVoted(true);
      setVotedCaptain(teamMembers.find(m => m.id === selectedCaptainId));
      setTimeout(() => setOpen(false), 1500);
    } catch (error) {
      console.error('Error submitting captain vote:', error);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1.5">
          <Crown className="h-3.5 w-3.5" />
          <span>{hasVoted ? 'View Your Vote' : 'Vote for Captain'}</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Team Captain Voting</DialogTitle>
          <DialogDescription>
            {hasVoted 
              ? 'You have already voted for a team captain.' 
              : 'Select a team member who you think would be the best captain.'}
          </DialogDescription>
        </DialogHeader>
        
        {status === 'loading' ? (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">Loading team members...</p>
          </div>
        ) : status === 'error' ? (
          <div className="py-6 text-center">
            <p className="text-sm text-destructive">Error loading team data. Please try again later.</p>
          </div>
        ) : hasVoted ? (
          <div className="py-4">
            <Card>
              <CardHeader className="pb-3">
                <h3 className="text-lg font-medium">Your Vote</h3>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={votedCaptain?.image} alt={votedCaptain?.name} />
                    <AvatarFallback>{votedCaptain?.name?.substring(0, 2) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{votedCaptain?.name}</p>
                    <p className="text-xs text-muted-foreground">{votedCaptain?.position || 'Team Member'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <div className="py-4">
              <RadioGroup
                value={selectedCaptainId || ''}
                onValueChange={setSelectedCaptainId}
                className="space-y-3"
              >
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center space-x-2 rounded-md border p-3 hover:bg-muted/50"
                  >
                    <RadioGroupItem value={member.id} id={`captain-${member.id}`} />
                    <Label htmlFor={`captain-${member.id}`} className="flex flex-1 items-center space-x-3 cursor-pointer">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.image} alt={member.name} />
                        <AvatarFallback>{member.name?.substring(0, 2) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.position || 'Team Member'}</p>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <DialogFooter>
              <Button
                onClick={handleVoteSubmit}
                disabled={isSubmitting || !selectedCaptainId}
                className="w-full"
              >
                {status === 'loading' ? 'Submitting...' : 
                 status === 'success' ? 'Vote Submitted!' : 
                 status === 'error' ? 'Try Again' : 'Submit Vote'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Team formation button component for admins
function TeamFormationButton({ phaseId, competitionId }: { phaseId: string, competitionId: string }) {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [players, setPlayers] = useState<any[]>([])
  const [teamCount, setTeamCount] = useState(2)
  const [generatedTeams, setGeneratedTeams] = useState<any[]>([])
  
  // Only admins can access this functionality
  const isAdmin = session?.user?.role === 'admin'
  
  // Fetch all registered players for the competition
  useEffect(() => {
    async function fetchPlayers() {
      if (open && isAdmin) {
        setStatus('loading');
        try {
          const response = await fetch(`/api/competitions/${competitionId}/registered-players`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch registered players');
          }
          
          const data = await response.json();
          setPlayers(data.players || []);
          setStatus('idle');
        } catch (error) {
          console.error('Error fetching registered players:', error);
          setStatus('error');
        }
      }
    }
    
    fetchPlayers();
  }, [open, competitionId, isAdmin]);
  
  // Generate teams with balanced player scores
  const generateTeams = () => {
    if (players.length === 0 || teamCount < 1) return;
    
    // Make a copy of players and sort by score in descending order
    const sortedPlayers = [...players]
      .filter(p => p.proficiencyScore !== undefined)
      .sort((a, b) => (b.proficiencyScore || 0) - (a.proficiencyScore || 0));
    
    // Create empty teams
    const teams: any[][] = Array.from({ length: teamCount }, () => []);
    
    // Use a serpentine draft pattern to distribute players evenly
    // This distributes players in a zigzag fashion to create balanced teams
    let teamIndex = 0;
    let direction = 1;
    
    for (const player of sortedPlayers) {
      teams[teamIndex].push(player);
      
      teamIndex += direction;
      
      if (teamIndex === teamCount - 1 || teamIndex === 0) {
        direction *= -1; // Reverse direction when we hit an edge
      }
    }
    
    // Calculate team stats
    const teamsWithStats = teams.map(teamPlayers => {
      const totalScore = teamPlayers.reduce((sum, player) => sum + (player.proficiencyScore || 0), 0);
      const avgScore = teamPlayers.length > 0 ? totalScore / teamPlayers.length : 0;
      
      return {
        players: teamPlayers,
        totalScore,
        avgScore,
        playerCount: teamPlayers.length
      };
    });
    
    setGeneratedTeams(teamsWithStats);
  };
  
  // Save the generated teams to the database
  const saveTeams = async () => {
    if (generatedTeams.length === 0) return;
    
    setIsSubmitting(true);
    setStatus('loading');
    
    try {
      const response = await fetch('/api/teams/create-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phaseId,
          competitionId,
          teams: generatedTeams.map((team, index) => ({
            name: `Team ${index + 1}`,
            playerIds: team.players.map((p: any) => p.id)
          }))
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save teams');
      }
      
      setStatus('success');
      setTimeout(() => setOpen(false), 1500);
    } catch (error) {
      console.error('Error saving teams:', error);
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If not admin, don't show anything
  if (!isAdmin) return null;
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          <span>Generate Teams</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Team Formation</DialogTitle>
          <DialogDescription>
            Generate balanced teams based on player scores
          </DialogDescription>
        </DialogHeader>
        
        {status === 'loading' && generatedTeams.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading player data...</p>
          </div>
        ) : status === 'error' && generatedTeams.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-destructive">Error loading player data. Please try again.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div>
                <Label htmlFor="team-count" className="mb-2 block">Number of Teams</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="team-count"
                    type="number"
                    min="2"
                    max={Math.floor(players.length / 2)}
                    value={teamCount}
                    onChange={(e) => setTeamCount(parseInt(e.target.value) || 2)}
                  />
                  <Button onClick={generateTeams} disabled={players.length === 0}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {players.length} players available
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Team Stats</Label>
                  {generatedTeams.length > 0 && (
                    <Button size="sm" variant="outline" onClick={() => setGeneratedTeams([])}>
                      Reset
                    </Button>
                  )}
                </div>
                
                {generatedTeams.length > 0 ? (
                  <div className="border rounded-md p-3">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Team</TableHead>
                          <TableHead>Players</TableHead>
                          <TableHead>Avg Score</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {generatedTeams.map((team, index) => (
                          <TableRow key={index}>
                            <TableCell>Team {index + 1}</TableCell>
                            <TableCell>{team.playerCount}</TableCell>
                            <TableCell>{team.avgScore.toFixed(1)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="border rounded-md p-4 text-center text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No teams generated yet</p>
                  </div>
                )}
              </div>
            </div>
            
            {generatedTeams.length > 0 && (
              <>
                <ScrollArea className="h-[300px] rounded-md border">
                  <div className="p-4">
                    <h3 className="font-medium mb-3">Team Roster Preview</h3>
                    <div className="space-y-6">
                      {generatedTeams.map((team, teamIndex) => (
                        <div key={teamIndex} className="space-y-2">
                          <h4 className="text-sm font-medium">Team {teamIndex + 1}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {team.players.map((player: any) => (
                              <div key={player.id} className="flex items-center space-x-2 border rounded-md p-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={player.image} alt={player.name} />
                                  <AvatarFallback>{player.name?.substring(0, 2) || 'U'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{player.name}</p>
                                </div>
                                <div className="text-sm">
                                  Score: {player.proficiencyScore || 0}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
                
                <DialogFooter className="pt-4">
                  <Button 
                    onClick={saveTeams} 
                    disabled={isSubmitting || generatedTeams.length === 0}
                    className="w-full"
                  >
                    {status === 'loading' ? 'Saving Teams...' : 
                    status === 'success' ? 'Teams Saved!' : 
                    status === 'error' ? 'Try Again' : 'Save Teams'}
                  </Button>
                </DialogFooter>
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function CompetitionTimeline({ competitionId }: { competitionId: string }) {
  const [timelineData, setTimelineData] = useState<CompetitionTimelineData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Load timeline for selected competition
  useEffect(() => {
    async function loadTimeline() {
      if (!competitionId) {
        return; // Exit if no competition ID provided
      }
      
      try {
        setLoading(true);
        console.log("Loading timeline for competition ID:", competitionId);
        const data = await getCompetitionTimeline(competitionId);
        
        if (data) {
          console.log("Timeline data loaded:", data);
          setTimelineData(data);
          setError(null);
        } else {
          console.error("Timeline data is null or undefined");
          setError("Timeline data is unavailable");
        }
      } catch (err) {
        console.error("Failed to load competition timeline:", err);
        setError(`Failed to load competition timeline: ${err instanceof Error ? err.message : "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    }

    loadTimeline();
  }, [competitionId]);

  if (loading) {
    return <TimelineSkeleton />
  }

  if (error || !timelineData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Competition Timeline</CardTitle>
          <CardDescription>
            {error || "No timeline information available"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            {error || "There is no timeline information available for the selected competition."}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Return early with a descriptive message if there are no phases
  if (!timelineData.phases || timelineData.phases.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Competition Timeline</CardTitle>
          <CardDescription>
            {timelineData.competitionName} ({timelineData.competitionYear})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            No timeline phases have been defined for this competition yet.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Competition Timeline</CardTitle>
          <CardDescription>
            Key dates and deadlines for the {timelineData.competitionYear} {timelineData.competitionName} competition
          </CardDescription>
        </div>
        <Badge 
          variant={
            timelineData.status === "active" 
              ? "default" 
              : timelineData.status === "upcoming" 
                ? "outline" 
                : "secondary"
          }
        >
          {timelineData.status === "active" 
            ? "Active" 
            : timelineData.status === "upcoming" 
              ? "Upcoming" 
              : timelineData.status === "completed" 
                ? "Completed" 
                : "Inactive"}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-border"></div>

          <div className="space-y-6">
            {timelineData.phases.map((phase) => (
              <div key={phase.id} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-background border flex items-center justify-center z-10">
                  {phase.status === "completed" ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : phase.status === "in-progress" ? (
                    <Clock className="h-6 w-6 text-amber-500" />
                  ) : (
                    <CalendarDays className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 pt-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium">{phase.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="text-xs capitalize"
                      >
                        {phase.type?.replace('_', ' ') || 'unknown'}
                      </Badge>
                      <Badge
                        variant={
                          phase.status === "completed"
                            ? "outline"
                            : phase.status === "in-progress"
                              ? "default"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {phase.status === "completed"
                          ? "Completed"
                          : phase.status === "in-progress"
                            ? "Active"
                            : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{phase.description}</p>
                  <div className="flex flex-col space-y-1">
                    <div className="text-xs text-muted-foreground flex justify-between">
                      <span>
                        {new Date(phase.startDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span>
                        {new Date(phase.endDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <Progress value={phase.progress} className="h-1.5" />
                      </div>
                      
                      {/* Action buttons based on phase type and status */}
                      {phase.status === "in-progress" && (
                        <div className="flex-shrink-0">
                          {phase.type === "player_scoring" && <PlayerScoringButton phaseId={phase.id} />}
                          {phase.type === "captain_voting" && <CaptainVotingButton phaseId={phase.id} />}
                          {phase.type === "team_formation" && <TeamFormationButton phaseId={phase.id} competitionId={competitionId} />}
                          {phase.type === "registration" && (
                            <Button variant="outline" size="sm" className="flex items-center gap-1.5" asChild>
                              <Link href="/register">
                                <UserPlus className="h-3.5 w-3.5" />
                                <span>Register</span>
                              </Link>
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TimelineSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Competition Timeline</CardTitle>
        <CardDescription>Loading timeline...</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-border"></div>

          <div className="space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="flex-shrink-0 w-14 h-14 rounded-full" />
                <div className="flex-1 pt-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

