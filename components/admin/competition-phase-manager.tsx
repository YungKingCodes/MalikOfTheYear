"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { ArrowRight, Save, UserPlus, Users, Crown, Trophy, Calendar, CheckCircle, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Competition phases
const PHASES = [
  {
    id: "registration",
    name: "Player Registration",
    description: "Players can register for the competition",
    icon: UserPlus,
  },
  {
    id: "team_formation",
    name: "Team Formation",
    description: "Teams are formed and balanced",
    icon: Users,
  },
  {
    id: "captain_voting",
    name: "Captain Voting",
    description: "Team members vote for their captains",
    icon: Crown,
  },
  {
    id: "game_scheduling",
    name: "Game Scheduling",
    description: "Games are scheduled and teams are assigned",
    icon: Calendar,
  },
  {
    id: "active_competition",
    name: "Active Competition",
    description: "Games are being played and scores are recorded",
    icon: Trophy,
  },
  {
    id: "completed",
    name: "Completed",
    description: "Competition is completed and winners are announced",
    icon: CheckCircle,
  },
]

export function CompetitionPhaseManager() {
  const { toast } = useToast()
  const [currentPhase, setCurrentPhase] = useState("registration")
  const [saving, setSaving] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [nextPhase, setNextPhase] = useState<string | null>(null)

  const currentPhaseIndex = PHASES.findIndex((phase) => phase.id === currentPhase)
  const nextPhaseInfo = currentPhaseIndex < PHASES.length - 1 ? PHASES[currentPhaseIndex + 1] : null

  const handleSavePhase = async () => {
    setSaving(true)
    try {
      // In a real app, save to API
      // For now, just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Phase Updated",
        description: `Competition phase has been set to "${PHASES.find((p) => p.id === currentPhase)?.name}"`,
      })
    } catch (error) {
      console.error("Failed to save phase:", error)
      toast({
        title: "Error",
        description: "Failed to save competition phase. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleAdvancePhase = () => {
    if (currentPhaseIndex < PHASES.length - 1) {
      setNextPhase(PHASES[currentPhaseIndex + 1].id)
      setConfirmDialogOpen(true)
    }
  }

  const confirmAdvancePhase = async () => {
    if (!nextPhase) return

    setSaving(true)
    try {
      // In a real app, save to API
      // For now, just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setCurrentPhase(nextPhase)
      setConfirmDialogOpen(false)
      setNextPhase(null)

      toast({
        title: "Phase Advanced",
        description: `Competition has advanced to the "${PHASES.find((p) => p.id === nextPhase)?.name}" phase.`,
      })
    } catch (error) {
      console.error("Failed to advance phase:", error)
      toast({
        title: "Error",
        description: "Failed to advance competition phase. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Competition Phase</CardTitle>
          <CardDescription>
            Manage the current phase of the competition. Each phase enables different features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Current Phase</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-base py-1 px-3">
                    {PHASES.find((phase) => phase.id === currentPhase)?.name}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-2">
                <Select value={currentPhase} onValueChange={setCurrentPhase}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Select phase" />
                  </SelectTrigger>
                  <SelectContent>
                    {PHASES.map((phase) => (
                      <SelectItem key={phase.id} value={phase.id}>
                        <div className="flex items-center gap-2">
                          <phase.icon className="h-4 w-4" />
                          {phase.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Manually select a phase to override the current phase</p>
              </div>
            </div>

            {/* Phase Timeline */}
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-6">
                {PHASES.map((phase, index) => {
                  const isActive = phase.id === currentPhase
                  const isPast = PHASES.findIndex((p) => p.id === currentPhase) > index
                  const isFuture = PHASES.findIndex((p) => p.id === currentPhase) < index

                  return (
                    <div key={phase.id} className="relative pl-10">
                      <div
                        className={`absolute left-0 top-1 h-8 w-8 rounded-full flex items-center justify-center ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : isPast
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <phase.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-medium">{phase.name}</h3>
                        <p className="text-sm text-muted-foreground">{phase.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Phase-specific actions */}
            <Tabs defaultValue={currentPhase} value={currentPhase} className="mt-6">
              <TabsContent value="registration">
                <Alert>
                  <UserPlus className="h-4 w-4" />
                  <AlertTitle>Player Registration Phase</AlertTitle>
                  <AlertDescription>
                    Players can register for the competition. Admins can approve or reject registrations.
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="team_formation">
                <Alert>
                  <Users className="h-4 w-4" />
                  <AlertTitle>Team Formation Phase</AlertTitle>
                  <AlertDescription>
                    Teams are being formed. Use the team formation tool to automatically balance teams based on player
                    scores.
                  </AlertDescription>
                </Alert>
                <div className="mt-4">
                  <Button variant="outline">Generate Balanced Teams</Button>
                </div>
              </TabsContent>

              <TabsContent value="captain_voting">
                <Alert>
                  <Crown className="h-4 w-4" />
                  <AlertTitle>Captain Voting Phase</AlertTitle>
                  <AlertDescription>
                    Team members are voting for their captains. Monitor voting progress and finalize results.
                  </AlertDescription>
                </Alert>
                <div className="mt-4">
                  <Button variant="outline">View Voting Progress</Button>
                </div>
              </TabsContent>

              <TabsContent value="game_scheduling">
                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertTitle>Game Scheduling Phase</AlertTitle>
                  <AlertDescription>
                    Games are being scheduled. Create the competition calendar and assign teams to games.
                  </AlertDescription>
                </Alert>
                <div className="mt-4">
                  <Button variant="outline">Manage Game Schedule</Button>
                </div>
              </TabsContent>

              <TabsContent value="active_competition">
                <Alert>
                  <Trophy className="h-4 w-4" />
                  <AlertTitle>Active Competition Phase</AlertTitle>
                  <AlertDescription>
                    The competition is active. Record game results and update team scores.
                  </AlertDescription>
                </Alert>
                <div className="mt-4">
                  <Button variant="outline">Record Game Results</Button>
                </div>
              </TabsContent>

              <TabsContent value="completed">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Competition Completed</AlertTitle>
                  <AlertDescription>
                    The competition is completed. View final results and prepare for the next competition.
                  </AlertDescription>
                </Alert>
                <div className="mt-4">
                  <Button variant="outline">View Final Results</Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleAdvancePhase}
            disabled={currentPhaseIndex >= PHASES.length - 1}
            className="gap-2"
          >
            Advance to Next Phase
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button onClick={handleSavePhase} disabled={saving} className="gap-2">
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Phase
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Advance Competition Phase</DialogTitle>
            <DialogDescription>
              Are you sure you want to advance the competition to the next phase? This action will affect all users and
              cannot be easily reversed.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Advancing from <strong>{PHASES.find((p) => p.id === currentPhase)?.name}</strong> to{" "}
                <strong>{nextPhaseInfo?.name}</strong> will:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Lock all actions from the current phase</li>
                  <li>Enable new features for the next phase</li>
                  <li>Send notifications to all participants</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAdvancePhase} disabled={saving}>
              {saving ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

