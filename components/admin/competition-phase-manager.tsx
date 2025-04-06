"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { ArrowRight, Calendar, CheckCircle, Clock, Edit, Plus, Save, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { Textarea } from "@/components/ui/textarea" 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  getEventManagement, 
  updateCurrentPhase, 
  addCompetitionPhase, 
  updateCompetitionPhase, 
  deleteCompetitionPhase 
} from "@/app/actions/event-management"
import { format } from "date-fns"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

// Phase schema for form validation
const phaseSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  order: z.coerce.number().int().positive(),
  type: z.string().min(1, { message: "Phase type is required." })
})

// Types
interface EventManagement {
  id: string;
  competitionId: string;
  currentPhaseId: string | null;
  currentPhase: CompetitionPhase | null;
  settings: any;
  phases: CompetitionPhase[];
}

interface CompetitionPhase {
  id: string;
  name: string;
  description?: string;
  startDate: Date | string;
  endDate: Date | string;
  status: "pending" | "in-progress" | "completed";
  order: number;
  competitionId: string;
  type: string;
}

type PhaseFormValues = z.infer<typeof phaseSchema>

interface CompetitionPhaseManagerProps {
  competitionId: string;
}

export function CompetitionPhaseManager({ competitionId }: CompetitionPhaseManagerProps) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null)
  const [eventManagement, setEventManagement] = useState<EventManagement | null>(null)
  const [loading, setLoading] = useState(true)
  const [phaseDialogOpen, setPhaseDialogOpen] = useState(false)
  const [deletingPhase, setDeletingPhase] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingPhase, setEditingPhase] = useState<CompetitionPhase | null>(null)

  // Form setup
  const form = useForm<PhaseFormValues>({
    resolver: zodResolver(phaseSchema),
    defaultValues: {
      name: "",
      description: "",
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      order: 1,
      type: "registration"
    }
  })

  useEffect(() => {
    async function loadEventManagement() {
      if (!competitionId) {
        console.error("No competition ID provided to CompetitionPhaseManager");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true)
        console.log("Loading event management data for competition ID:", competitionId)
        
        // Get event management data for the provided competition ID
        const data = await getEventManagement(competitionId)
        console.log("Event management data loaded:", data)
        setEventManagement(data as EventManagement)
        
        if (data.currentPhase) {
          setSelectedPhaseId(data.currentPhase.id)
        }
        
        // Log the phases that were loaded
        if (data.phases) {
          console.log(`Loaded ${data.phases.length} phases for competition`)
        } else {
          console.warn("No phases found in the loaded event management data")
        }
      } catch (error) {
        console.error("Failed to load event management:", error)
        toast({
          title: "Error",
          description: "Failed to load competition phase data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadEventManagement()
  }, [competitionId, toast])

  const currentPhase = eventManagement?.currentPhase || null
  const phases = eventManagement?.phases || []

  const handlePhaseSelect = (phaseId: string) => {
    setSelectedPhaseId(phaseId)
  }

  const handleUpdateCurrentPhase = async () => {
    if (!selectedPhaseId || !competitionId) return
    
    setSaving(true)
    try {
      // Update the current phase in the database
      const updated = await updateCurrentPhase(competitionId, selectedPhaseId)
      
      // Refresh all event management data instead of trying to patch it
      const refreshedData = await getEventManagement(competitionId)
      setEventManagement(refreshedData as EventManagement)

      toast({
        title: "Phase Updated",
        description: updated.currentPhase 
          ? `Current phase has been set to "${updated.currentPhase.name}"`
          : "Current phase has been updated successfully",
      })
    } catch (error) {
      console.error("Failed to update phase:", error)
      toast({
        title: "Error",
        description: "Failed to update competition phase. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const openAddPhaseDialog = () => {
    // Reset form to defaults for new phase
    form.reset({
      name: "",
      description: "",
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      order: phases.length + 1,
      type: "registration"
    })
    setEditingPhase(null)
    setPhaseDialogOpen(true)
  }

  const openEditPhaseDialog = (phase: CompetitionPhase) => {
    form.reset({
      name: phase.name,
      description: phase.description || "",
      startDate: new Date(phase.startDate),
      endDate: new Date(phase.endDate),
      order: phase.order,
      type: phase.type
    })
    setEditingPhase(phase)
    setPhaseDialogOpen(true)
  }

  const handleSavePhase = async (values: PhaseFormValues) => {
    if (!competitionId) return
    
    setSaving(true)
    try {
      // Prepare data for server action
      const phaseData = {
        ...values,
        competitionId: competitionId,
        status: editingPhase?.status || "pending"
      }
      
      // Create or update phase
      let updatedPhase
      if (editingPhase) {
        updatedPhase = await updateCompetitionPhase(editingPhase.id, phaseData)
        toast({
          title: "Phase Updated",
          description: `Competition phase "${values.name}" has been updated.`,
        })
      } else {
        updatedPhase = await addCompetitionPhase(phaseData)
        toast({
          title: "Phase Added",
          description: `New competition phase "${values.name}" has been added.`,
        })
      }
      
      // Refresh event management data
      const data = await getEventManagement(competitionId)
      setEventManagement(data as EventManagement)
      
      // Close the dialog
      setPhaseDialogOpen(false)
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

  const confirmDeletePhase = (phaseId: string) => {
    setDeletingPhase(phaseId)
    setDeleteDialogOpen(true)
  }

  const handleDeletePhase = async () => {
    if (!deletingPhase || !competitionId) return
    
    setSaving(true)
    try {
      await deleteCompetitionPhase(deletingPhase)
      
      // Refresh event management data
      const data = await getEventManagement(competitionId)
      setEventManagement(data as EventManagement)
      
      toast({
        title: "Phase Deleted",
        description: "Competition phase has been deleted successfully.",
      })
      
      setDeleteDialogOpen(false)
      setDeletingPhase(null)
    } catch (error) {
      console.error("Failed to delete phase:", error)
      toast({
        title: "Error",
        description: "Failed to delete competition phase. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Competition Phases</CardTitle>
          <CardDescription>Loading competition phase data...</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <Clock className="h-12 w-12 mb-4 mx-auto text-muted-foreground" />
            <p>Loading phase data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!eventManagement) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Competition Phases</CardTitle>
          <CardDescription>Configure and manage competition phases</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertTitle>No Event Management Found</AlertTitle>
            <AlertDescription>
              Could not find event management data for the current competition.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Competition Phases</CardTitle>
            <CardDescription>Configure and manage phases for your competition</CardDescription>
          </div>
          <Button variant="outline" onClick={openAddPhaseDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Phase
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {phases.length > 0 ? (
              phases.map((phase: CompetitionPhase) => {
                const isActive = currentPhase?.id === phase.id;
                const isSelected = selectedPhaseId === phase.id;
                const statusColor = 
                  phase.status === 'completed' ? 'bg-green-500 hover:bg-green-600' :
                  phase.status === 'in-progress' ? 'bg-blue-500 hover:bg-blue-600' :
                  'bg-gray-500 hover:bg-gray-600';
                
                return (
                  <div 
                    key={phase.id} 
                    className={`p-4 rounded-lg border ${isSelected ? 'border-primary' : 'border-border'} hover:border-primary transition-colors`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">{phase.name}</h3>
                          <Badge className={statusColor}>{phase.status}</Badge>
                          {isActive && (
                            <Badge variant="outline" className="ml-2">Current Phase</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{phase.description || 'No description available'}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>
                            {format(new Date(phase.startDate), 'MMM d, yyyy')} - {format(new Date(phase.endDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditPhaseDialog(phase)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => confirmDeletePhase(phase.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                        
                        {!isActive && (
                          <Button
                            variant="default"
                            size="sm"
                            disabled={isActive}
                            onClick={() => {
                              handlePhaseSelect(phase.id);
                              handleUpdateCurrentPhase();
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Make Active
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No phases created yet. Click "Add Phase" to create your first phase.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Add/Edit Phase Dialog */}
      <Dialog open={phaseDialogOpen} onOpenChange={setPhaseDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingPhase ? 'Edit Phase' : 'Add New Phase'}</DialogTitle>
            <DialogDescription>
              {editingPhase 
                ? 'Update the details for this competition phase.' 
                : 'Create a new phase for your competition.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSavePhase)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phase Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Registration" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Brief description of this phase" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value}
                          setDate={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value}
                          setDate={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phase Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a phase type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="registration">Player Registration</SelectItem>
                        <SelectItem value="player_scoring">Player Scoring</SelectItem>
                        <SelectItem value="team_formation">Team Forming</SelectItem>
                        <SelectItem value="captain_voting">Captain Voting</SelectItem>
                        <SelectItem value="game_selection">Game Selection</SelectItem>
                        <SelectItem value="competition">Competition</SelectItem>
                        <SelectItem value="award_ceremony">Award Ceremony</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      This determines what functionality is enabled during this phase.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>
                      The sequence this phase appears in the competition timeline.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setPhaseDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Phase'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Phase</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this phase? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeletePhase}
              disabled={saving}
            >
              {saving ? 'Deleting...' : 'Delete Phase'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

