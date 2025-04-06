"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCompetitionById, updateCompetition } from "@/app/actions/competitions"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function EditCompetitionPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [competition, setCompetition] = useState({
    id: "",
    name: "",
    description: "",
    year: new Date().getFullYear(),
    startDate: new Date(),
    endDate: new Date(),
    status: "pending"
  })

  useEffect(() => {
    async function loadCompetition() {
      try {
        setLoading(true)
        const data = await getCompetitionById(id)
        
        if (!data) {
          toast({
            title: "Competition not found",
            description: "The requested competition could not be found.",
            variant: "destructive"
          })
          router.push("/admin/competitions")
          return
        }
        
        // Format dates as JavaScript Date objects
        setCompetition({
          id: data.id,
          name: data.name,
          description: data.description || "",
          year: data.year,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          status: data.status
        })
      } catch (error) {
        console.error("Failed to load competition:", error)
        toast({
          title: "Error loading data",
          description: "Could not load competition data. Please try again.",
          variant: "destructive"
        })
        router.push("/admin/competitions")
      } finally {
        setLoading(false)
      }
    }
    
    loadCompetition()
  }, [id, router, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCompetition(prev => ({ ...prev, [name]: value }))
  }

  const handleStatusChange = (value: string) => {
    setCompetition(prev => ({ ...prev, status: value }))
  }

  const handleSave = async () => {
    if (!competition.name.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a competition name.",
        variant: "destructive"
      })
      return
    }

    setSaving(true)
    try {
      await updateCompetition({
        id: competition.id,
        name: competition.name,
        description: competition.description,
        year: competition.year,
        startDate: competition.startDate.toISOString(),
        endDate: competition.endDate.toISOString(),
        status: competition.status
      })
      
      toast({
        title: "Competition updated",
        description: `Competition "${competition.name}" has been updated successfully.`
      })
      
      // Go back to competitions list
      router.push("/admin/competitions")
    } catch (error) {
      console.error("Failed to update competition:", error)
      toast({
        title: "Error updating competition",
        description: "Could not update the competition. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading competition data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-3xl">
      <div className="flex flex-col space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Edit Competition</h1>
        <p className="text-muted-foreground">
          Update the details for the selected competition
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Competition Details</CardTitle>
          <CardDescription>
            Update the basic information for this competition
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Competition Name</Label>
              <Input 
                id="name" 
                name="name"
                placeholder="Enter competition name" 
                value={competition.name}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                name="description"
                placeholder="Enter competition description" 
                value={competition.description}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input 
                id="year" 
                name="year"
                type="number" 
                placeholder="Enter year" 
                value={competition.year.toString()}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      {format(competition.startDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={competition.startDate}
                      onSelect={(date) => date && setCompetition(prev => ({ ...prev, startDate: date }))}
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
                      {format(competition.endDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={competition.endDate}
                      onSelect={(date) => date && setCompetition(prev => ({ ...prev, endDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={competition.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select competition status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Note: Only one competition can be active at a time
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end gap-4 mt-6">
        <Button
          variant="outline"
          onClick={() => router.push("/admin/competitions")}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
} 