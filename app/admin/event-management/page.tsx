"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Check, CheckCircle, Clock, Save, Settings as SettingsIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getCompetitions } from "@/app/actions/competitions"
import { getEventManagement, updateEventManagement } from "@/app/actions/event-management"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { CompetitionPhaseManager } from "@/components/admin/competition-phase-manager"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSearchParams, useRouter } from "next/navigation"

// Define interface for competition
interface Competition {
  id: string
  name: string
  year: number
  status: string
}

// Helper function to handle tab changes programmatically
const selectTab = (tabValue: string) => {
  const tabTrigger = document.querySelector(`[data-value="${tabValue}"]`) as HTMLButtonElement | null;
  if (tabTrigger) {
    tabTrigger.click();
  }
};

export default function EventManagementPage() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>("")
  const [activeCompetition, setActiveCompetition] = useState<any>(null)
  const [eventManagement, setEventManagement] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<{
    enablePlayerRegistration: boolean;
    enableTeamFormation: boolean;
    enableCaptainVoting: boolean;
    enableGameScheduling: boolean;
  }>({
    enablePlayerRegistration: false,
    enableTeamFormation: false,
    enableCaptainVoting: false,
    enableGameScheduling: false
  })

  useEffect(() => {
    async function loadData() {
      try {
        // Get all competitions
        const allCompetitions = await getCompetitions()
        if (!allCompetitions?.length) {
          setLoading(false)
          return
        }
        
        setCompetitions(allCompetitions)
        
        // Check for competition ID in URL
        const competitionIdFromURL = searchParams.get('competitionId')
        
        // Determine which competition to use
        let competitionToUse;
        
        if (competitionIdFromURL) {
          // Use the one from URL if available
          competitionToUse = allCompetitions.find(comp => comp.id === competitionIdFromURL)
        }
        
        if (!competitionToUse) {
          // Otherwise, find active competition, or use first one
          competitionToUse = allCompetitions.find(comp => comp.status === "active") || allCompetitions[0]
        }
        
        if (competitionToUse) {
          setSelectedCompetitionId(competitionToUse.id)
          setActiveCompetition(competitionToUse)
          
          // Get event management data
          const eventData = await getEventManagement(competitionToUse.id)
          setEventManagement(eventData)
          
          // Set settings from fetched data
          if (eventData?.settings) {
            setSettings(eventData.settings as typeof settings)
          }
        }
      } catch (error) {
        console.error("Failed to load event management data:", error)
        toast({
          title: "Error loading data",
          description: "Could not load event management data. Try refreshing the page.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast, searchParams])

  // Handle competition selection change
  const handleCompetitionChange = useCallback((competitionId: string) => {
    setSelectedCompetitionId(competitionId)
    const selected = competitions.find(comp => comp.id === competitionId)
    
    if (selected) {
      setActiveCompetition(selected)
      
      // Update URL with the selected competition ID
      router.push(`/admin/event-management?competitionId=${competitionId}`)
      
      // Load event management data for the selected competition
      setLoading(true)
      getEventManagement(competitionId)
        .then(eventData => {
          setEventManagement(eventData)
          if (eventData?.settings) {
            setSettings(eventData.settings as typeof settings)
          }
        })
        .catch(error => {
          console.error("Failed to load event management data:", error)
          toast({
            title: "Error loading data",
            description: "Could not load event management data for the selected competition.",
            variant: "destructive"
          })
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [competitions, router, toast])

  const handleToggleSetting = useCallback((setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }))
  }, [])

  const handleSaveSettings = useCallback(async () => {
    if (!activeCompetition) return
    
    setSaving(true)
    try {
      await updateEventManagement(activeCompetition.id, {
        settings
      })
      
      toast({
        title: "Settings saved",
        description: "Event management settings have been updated.",
      })
    } catch (error) {
      console.error("Failed to save settings:", error)
      toast({
        title: "Error saving settings",
        description: "Could not save settings. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }, [activeCompetition, settings, toast])

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-40 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Separator />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!activeCompetition) {
    return (
      <div className="px-6 py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Competition Selected</AlertTitle>
          <AlertDescription>
            There is no competition to manage. Please create a competition first.
          </AlertDescription>
        </Alert>
        <div className="mt-6 flex justify-center">
          <Button asChild>
            <Link href="/admin/competitions/new">Create New Competition</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Management</h1>
          <p className="text-muted-foreground">
            Manage all aspects of the competition
          </p>
        </div>
        <Button onClick={handleSaveSettings} disabled={saving}>
          {saving ? "Saving..." : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      <div className="flex justify-between items-center mt-6">
        <div>
          <h2 className="text-xl font-semibold">{activeCompetition.name} {activeCompetition.year}</h2>
          <p className="text-muted-foreground">Status: {activeCompetition.status}</p>
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

      <Separator className="my-6" />

      <Tabs defaultValue="phases">
        <TabsList className="mb-4">
          <TabsTrigger value="phases">Competition Phases</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="phases" className="space-y-6">
          <CompetitionPhaseManager competitionId={selectedCompetitionId} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Settings</CardTitle>
              <CardDescription>Configure what features are enabled at each phase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="player-registration">Player Registration</Label>
                    <p className="text-sm text-muted-foreground">Allow players to register for the competition</p>
                  </div>
                  <Switch 
                    id="player-registration" 
                    checked={settings.enablePlayerRegistration}
                    onCheckedChange={() => handleToggleSetting('enablePlayerRegistration')}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="team-formation">Team Formation</Label>
                    <p className="text-sm text-muted-foreground">Enable the team formation process</p>
                  </div>
                  <Switch 
                    id="team-formation" 
                    checked={settings.enableTeamFormation}
                    onCheckedChange={() => handleToggleSetting('enableTeamFormation')}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="captain-voting">Captain Voting</Label>
                    <p className="text-sm text-muted-foreground">Allow team members to vote for captains</p>
                  </div>
                  <Switch 
                    id="captain-voting" 
                    checked={settings.enableCaptainVoting}
                    onCheckedChange={() => handleToggleSetting('enableCaptainVoting')}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="game-scheduling">Game Scheduling</Label>
                    <p className="text-sm text-muted-foreground">Enable game scheduling and management</p>
                  </div>
                  <Switch 
                    id="game-scheduling" 
                    checked={settings.enableGameScheduling}
                    onCheckedChange={() => handleToggleSetting('enableGameScheduling')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Competition Details</CardTitle>
                <CardDescription>Basic information about the competition</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Name</h3>
                    <p>{activeCompetition.name}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Dates</h3>
                    <p>
                      {new Date(activeCompetition.startDate).toLocaleDateString()} - {" "}
                      {new Date(activeCompetition.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Status</h3>
                    <div className="flex items-center">
                      <div className="mr-2 h-2.5 w-2.5 rounded-full bg-green-500"></div>
                      <span className="font-medium text-green-700">Active</span>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button variant="outline" asChild>
                      <Link href={`/admin/competitions/${activeCompetition.id}`}>
                        Edit Competition Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Phase</CardTitle>
                <CardDescription>Status of the current competition phase</CardDescription>
              </CardHeader>
              <CardContent>
                {eventManagement?.currentPhase ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">{eventManagement.currentPhase.name}</h3>
                      <Badge className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {eventManagement.currentPhase.description || 'No description available'}
                      </p>
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-4 w-4" />
                        <span>
                          {format(new Date(eventManagement.currentPhase.startDate), 'MMM d')} - {format(new Date(eventManagement.currentPhase.endDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="mt-4" asChild>
                        <Link href="#" onClick={(e) => {
                          e.preventDefault();
                          selectTab("phases");
                        }}>
                          Manage Phases
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
                    <p className="text-center text-sm">No active phase found</p>
                    <Button variant="outline" size="sm" className="mt-4" asChild>
                      <Link href="#" onClick={(e) => {
                        e.preventDefault();
                        selectTab("phases");
                      }}>
                        Set Up Phases
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Competition Progress</CardTitle>
                <CardDescription>Current status and upcoming milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {eventManagement?.phases ? (
                    eventManagement.phases.map((phase: any, index: number) => {
                      const isCompleted = phase.status === 'completed';
                      const isInProgress = phase.status === 'in-progress';
                      const isPending = phase.status === 'pending';
                      
                      return (
                        <div key={phase.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
                              {isInProgress && <Clock className="h-5 w-5 text-blue-500" />}
                              {isPending && <div className="h-5 w-5 rounded-full border-2 border-muted" />}
                              <span>{phase.name}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {isCompleted ? '100%' : (isInProgress ? 'In Progress' : 'Pending')}
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div 
                              className={`h-2 rounded-full ${
                                isCompleted ? 'w-full bg-green-500' : 
                                (isInProgress ? 'w-1/2 bg-blue-500' : 'w-0')
                              }`}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p>No phases configured yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 