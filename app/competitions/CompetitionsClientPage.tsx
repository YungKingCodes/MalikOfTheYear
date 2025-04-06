"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Trophy, Users, Crown, Plus, CheckCircle2, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { getUserCompetitionRegistrations, registerUserForCompetition } from "@/app/actions/competitions"
import { LoadingSpinner } from "@/components/loading-skeletons/competition-detail-skeleton"

// Define competition type
interface Competition {
  id: string
  name: string
  description: string
  year: number
  startDate: string
  endDate: string
  status: string
  theme: string
  teams?: number
  winnerTeam?: string
  goat?: string
  prize?: string
}

// Define registration type
interface UserRegistration {
  id: string
  competitionId: string
  status: string
  registeredAt: Date
  competition: {
    id: string
    name: string
    year: number
    status: string
  }
}

export default function CompetitionsClientPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [userRegistrations, setUserRegistrations] = useState<UserRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null)
  const { data: session } = useSession()
  const { toast } = useToast()
  const user = session?.user

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const response = await fetch('/api/competitions')
        if (!response.ok) {
          throw new Error('Failed to fetch competitions')
        }
        const data = await response.json()
        setCompetitions(data)
      } catch (err) {
        console.error('Error fetching competitions:', err)
        setError('Failed to load competitions. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchCompetitions()
  }, [])

  // Fetch user registrations
  useEffect(() => {
    const fetchUserRegistrations = async () => {
      if (session?.user) {
        try {
          const registrations = await getUserCompetitionRegistrations()
          setUserRegistrations(registrations)
        } catch (err) {
          console.error('Error fetching user registrations:', err)
        }
      }
    }

    fetchUserRegistrations()
  }, [session?.user])

  // Check if user is registered for a competition
  const isUserRegistered = (competitionId: string) => {
    return userRegistrations.some(reg => reg.competitionId === competitionId)
  }

  // Handle registration modal open
  const handleOpenRegistration = (competition: Competition) => {
    setSelectedCompetition(competition)
    setShowRegistrationModal(true)
  }

  // Handle user registration for a competition
  const handleRegisterForCompetition = async () => {
    if (!selectedCompetition) return

    setRegistering(true)
    try {
      const result = await registerUserForCompetition(selectedCompetition.id)
      if (result.success) {
        // Add the new registration to state
        const newRegistration = {
          id: result.registration.id,
          competitionId: selectedCompetition.id,
          status: "registered",
          registeredAt: new Date(),
          competition: {
            id: selectedCompetition.id,
            name: selectedCompetition.name,
            year: selectedCompetition.year,
            status: selectedCompetition.status
          }
        }
        setUserRegistrations([...userRegistrations, newRegistration])
        
        // Close modal and show success message
        setShowRegistrationModal(false)
        toast({
          title: "Registration successful",
          description: `You have been registered for ${selectedCompetition.name}`,
          variant: "default"
        })
      }
    } catch (err) {
      console.error('Error registering for competition:', err)
      toast({
        title: "Registration failed",
        description: err instanceof Error ? err.message : "Failed to register for the competition",
        variant: "destructive"
      })
    } finally {
      setRegistering(false)
    }
  }

  if (loading) {
    return <LoadingSpinner text="Loading competitions..." />
  }

  if (error) {
    return <div className="text-red-500 p-8">{error}</div>
  }

  // Handle empty competitions array
  if (competitions.length === 0) {
    return (
      <div className="flex flex-col gap-8 p-4 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Competitions</h1>
            <p className="text-muted-foreground">View and manage annual Malik of The Year competitions</p>
          </div>
        </div>
        
        <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
          <h3 className="text-xl font-medium mb-2">No Competitions Found</h3>
          <p className="text-muted-foreground mb-6">There are no competitions set up yet.</p>
          {user?.role === "admin" && (
            <Button asChild>
              <Link href="/admin/competitions">Manage Competitions</Link>
            </Button>
          )}
        </div>
      </div>
    )
  }

  const activeCompetitions = competitions.filter(comp => comp.status === 'active')
  const completedCompetitions = competitions.filter(comp => comp.status === 'completed')
  
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Competitions</h1>
          <p className="text-muted-foreground">View and manage annual Malik of The Year competitions</p>
        </div>
        {user?.role === "admin" && (
          <Button asChild>
            <Link href="/admin/competitions">Manage Competitions</Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {activeCompetitions.length > 0 && activeCompetitions.map(competition => (
          <Card key={competition.id} className="overflow-hidden">
            <div className="relative h-48">
              <Badge className="absolute top-4 right-4 z-10">Active</Badge>
              {isUserRegistered(competition.id) && (
                <Badge variant="success" className="absolute top-4 left-4 z-10 bg-green-600">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Registered
                </Badge>
              )}
              <Image
                src="/placeholder.svg?height=192&width=384"
                alt={competition.name}
                fill
                className="object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>{competition.name}</CardTitle>
              <CardDescription>{competition.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(competition.startDate).toLocaleDateString()} - {new Date(competition.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Top Prize: {competition.prize || "TBD"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{competition.teams || 0} Teams</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link href={`/competitions/${competition.id}`}>View Competition</Link>
              </Button>
              {!isUserRegistered(competition.id) && user && (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => handleOpenRegistration(competition)}
                >
                  Register for Competition
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}

        {completedCompetitions.slice(0, 2).map(competition => (
          <Card key={competition.id} className="overflow-hidden">
            <div className="relative h-48">
              <Badge className="absolute top-4 right-4 z-10" variant="secondary">
                Completed
              </Badge>
              {isUserRegistered(competition.id) && (
                <Badge variant="outline" className="absolute top-4 left-4 z-10">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> Participated
                </Badge>
              )}
              <Image src="/placeholder.svg?height=192&width=384" alt={competition.name} fill className="object-cover" />
            </div>
            <CardHeader>
              <CardTitle>{competition.name}</CardTitle>
              <CardDescription>{competition.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(competition.startDate).toLocaleDateString()} - {new Date(competition.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Winner: {competition.winnerTeam || "TBD"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">GOAT: {competition.goat || "TBD"}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/competitions/${competition.id}`}>View Archive</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Competition History</CardTitle>
          <CardDescription>Complete history of all Malik of The Year competitions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div className="rounded-md border">
              <div className="grid grid-cols-5 p-4 font-medium">
                <div>Year</div>
                <div>Theme</div>
                <div>Teams</div>
                <div>Winner</div>
                <div>GOAT</div>
              </div>
              <div className="divide-y">
                {competitions.sort((a, b) => b.year - a.year).map((competition) => (
                  <div key={competition.id} className="grid grid-cols-5 p-4">
                    <div className="font-medium">{competition.year}</div>
                    <div>{competition.theme}</div>
                    <div>{competition.teams || 0}</div>
                    <div>{competition.status === 'active' ? 'In Progress' : (competition.winnerTeam || 'TBD')}</div>
                    <div>{competition.status === 'active' ? 'TBD' : (competition.goat || 'TBD')}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration Modal */}
      <Dialog open={showRegistrationModal} onOpenChange={setShowRegistrationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register for Competition</DialogTitle>
            <DialogDescription>
              You are about to register for {selectedCompetition?.name}. 
              This will add you to the participant list.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-2"><strong>Competition:</strong> {selectedCompetition?.name}</p>
            <p className="mb-2"><strong>Year:</strong> {selectedCompetition?.year}</p>
            <p className="mb-2"><strong>Dates:</strong> {selectedCompetition ? `${new Date(selectedCompetition.startDate).toLocaleDateString()} - ${new Date(selectedCompetition.endDate).toLocaleDateString()}` : ""}</p>
            <p className="mb-2"><strong>Status:</strong> {selectedCompetition?.status}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegistrationModal(false)}>Cancel</Button>
            <Button 
              onClick={handleRegisterForCompetition}
              disabled={registering}
            >
              {registering ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

