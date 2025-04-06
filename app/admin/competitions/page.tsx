"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, CalendarIcon, ChevronRight, Edit, Plus, Trophy, Trash } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { getCompetitions, createCompetition, deleteCompetition } from "@/app/actions/competitions"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function CompetitionsAdminPage() {
  const { toast } = useToast()
  const [competitions, setCompetitions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [competitionToDelete, setCompetitionToDelete] = useState<string | null>(null)
  
  // Form state
  const [newCompetition, setNewCompetition] = useState({
    name: "",
    description: "",
    year: new Date().getFullYear(),
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)), // 3 months from now
    status: "inactive" // Default status
  })

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const data = await getCompetitions()
        setCompetitions(data || [])
      } catch (error) {
        console.error("Failed to load competitions data:", error)
        toast({
          title: "Error loading data",
          description: "Could not load competitions data. Try refreshing the page.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewCompetition(prev => ({ ...prev, [name]: value }))
  }

  const handleCreateCompetition = async () => {
    if (!newCompetition.name.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide all required competition information.",
        variant: "destructive"
      })
      return
    }

    setIsCreating(true)
    try {
      await createCompetition({
        name: newCompetition.name,
        description: newCompetition.description,
        year: newCompetition.year,
        startDate: newCompetition.startDate.toISOString(),
        endDate: newCompetition.endDate.toISOString(),
        status: newCompetition.status
      })
      
      // Refresh the competitions list
      const data = await getCompetitions()
      setCompetitions(data || [])
      
      setCreateDialogOpen(false)
      setNewCompetition({
        name: "",
        description: "",
        year: new Date().getFullYear(),
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
        status: "inactive"
      })
      
      toast({
        title: "Competition created",
        description: `Competition "${newCompetition.name}" has been created successfully.`
      })
    } catch (error) {
      console.error("Failed to create competition:", error)
      toast({
        title: "Error creating competition",
        description: "Could not create the competition. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteCompetition = async (id: string) => {
    setIsDeleting(true)
    try {
      await deleteCompetition(id)
      
      // Refresh the competitions list
      const data = await getCompetitions()
      setCompetitions(data || [])
      
      toast({
        title: "Competition deleted",
        description: "The competition has been deleted successfully."
      })
    } catch (error) {
      console.error("Failed to delete competition:", error)
      toast({
        title: "Error deleting competition",
        description: "Could not delete the competition. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
      setCompetitionToDelete(null)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Competitions</h1>
          <div className="h-10 w-32 bg-muted animate-pulse rounded-md"></div>
        </div>
        <Separator />
        <div className="h-64 bg-muted animate-pulse rounded-md"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Competitions</h1>
          <p className="text-muted-foreground">
            Manage competitions and seasons
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Competition
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create New Competition</DialogTitle>
              <DialogDescription>
                Add a new competition season to the platform. You can have multiple competitions in the same year as long as they have unique names.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Competition Name</Label>
                <Input 
                  id="name" 
                  name="name"
                  placeholder="Enter competition name" 
                  value={newCompetition.name}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description"
                  placeholder="Enter competition description" 
                  value={newCompetition.description}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input 
                  id="year" 
                  name="year"
                  type="number" 
                  placeholder="Enter year" 
                  value={newCompetition.year.toString()}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="startDate"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(newCompetition.startDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newCompetition.startDate}
                        onSelect={(date) => date && setNewCompetition(prev => ({ ...prev, startDate: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="endDate"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(newCompetition.endDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newCompetition.endDate}
                        onSelect={(date) => date && setNewCompetition(prev => ({ ...prev, endDate: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={newCompetition.status} 
                  onValueChange={(value) => setNewCompetition(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateCompetition}
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create Competition"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Separator className="my-6" />

      <Card>
        <CardHeader>
          <CardTitle>Competitions</CardTitle>
          <CardDescription>
            All competitions, past and upcoming.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {competitions.length === 0 ? (
            <div className="py-8 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <Trophy className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No competitions yet</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Get started by creating a new competition season.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Competition
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competitions.map((competition) => (
                  <TableRow key={competition.id}>
                    <TableCell className="font-medium">{competition.name}</TableCell>
                    <TableCell>{competition.year}</TableCell>
                    <TableCell>
                      <Badge 
                        className={cn(
                          competition.status === "active" && "bg-green-500 hover:bg-green-600",
                          competition.status === "pending" && "bg-blue-500 hover:bg-blue-600",
                          competition.status === "completed" && "bg-gray-500 hover:bg-gray-600"
                        )}
                      >
                        {competition.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(competition.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(competition.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/competitions/${competition.id}`}>
                            <Edit className="mr-1 h-4 w-4" />
                            Edit
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => setCompetitionToDelete(competition.id)}
                              disabled={isDeleting && competitionToDelete === competition.id}
                            >
                              <Trash className="mr-1 h-4 w-4" />
                              {isDeleting && competitionToDelete === competition.id ? "Deleting..." : "Delete"}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the competition
                                and all associated data, including teams, games, and phases.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setCompetitionToDelete(null)}>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteCompetition(competition.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/event-management?competitionId=${competition.id}`}>
                            Manage
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 