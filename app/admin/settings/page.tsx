"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Save } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Define the settings interface
export interface SystemSettings {
  registrationOpen: boolean;
  allowTeamRegistration: boolean;
  displayScoreboard: boolean;
  maintenanceMode: boolean;
  emailNotifications: boolean;
  siteTitle: string;
  contactEmail: string;
  maxTeamSize: number;
  competitionPhases: string[];
}

export default function SettingsAdminPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/settings', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        })
        
        if (!response.ok) {
          console.error('Failed to fetch settings from API')
          // Use default settings if API call fails
          setSettings({
            registrationOpen: true,
            allowTeamRegistration: true,
            displayScoreboard: true,
            maintenanceMode: false,
            emailNotifications: true,
            siteTitle: "Malik of the Year",
            contactEmail: "admin@malikoftheyear.com",
            maxTeamSize: 5,
            competitionPhases: ["registration", "qualification", "finals"]
          })
          return
        }
        
        const data = await response.json()
        setSettings(data)
      } catch (error) {
        console.error("Failed to load settings:", error)
        // Use default settings if API call fails
        setSettings({
          registrationOpen: true,
          allowTeamRegistration: true,
          displayScoreboard: true,
          maintenanceMode: false,
          emailNotifications: true,
          siteTitle: "Malik of the Year",
          contactEmail: "admin@malikoftheyear.com",
          maxTeamSize: 5,
          competitionPhases: ["registration", "qualification", "finals"]
        })
        toast({
          title: "Using default settings",
          description: "Could not load system settings. Using defaults for now.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [toast])

  const handleSwitchChange = (name: string) => {
    setSettings((prev: SystemSettings | null) => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: !prev[name as keyof SystemSettings]
      }
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettings((prev: SystemSettings | null) => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: value
      }
    })
  }

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettings((prev: SystemSettings | null) => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: parseInt(value, 10)
      }
    })
  }

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    try {
      setSaving(true)
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(settings),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save settings')
      }
      
      toast({
        title: "Settings saved",
        description: "Your changes have been saved successfully."
      })
    } catch (error) {
      console.error("Failed to save settings:", error)
      toast({
        title: "Error saving settings",
        description: error instanceof Error ? error.message : "Could not save system settings. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <div className="h-10 w-32 bg-muted animate-pulse rounded-md"></div>
        </div>
        <Separator />
        <div className="h-64 bg-muted animate-pulse rounded-md"></div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load system settings. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Configure application-wide settings
          </p>
        </div>
        <Button onClick={handleSaveSettings} disabled={saving} className="w-full md:w-auto">
          {saving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Separator className="my-4 md:my-6" />

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full md:w-auto mb-4 md:mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="registration">Registration</TabsTrigger>
          <TabsTrigger value="competition">Competition</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic system settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteTitle">Site Title</Label>
                  <Input
                    id="siteTitle"
                    name="siteTitle"
                    value={settings.siteTitle}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Put the site in maintenance mode to prevent user access
                    </p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onCheckedChange={() => handleSwitchChange("maintenanceMode")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="registration" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Registration Settings</CardTitle>
              <CardDescription>
                Configure user and team registration settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="space-y-0.5">
                  <Label htmlFor="registrationOpen">Registration Open</Label>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Allow new user registrations
                  </p>
                </div>
                <Switch
                  id="registrationOpen"
                  checked={settings.registrationOpen}
                  onCheckedChange={() => handleSwitchChange("registrationOpen")}
                />
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="space-y-0.5">
                  <Label htmlFor="allowTeamRegistration">Allow Team Registration</Label>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Allow users to create and join teams
                  </p>
                </div>
                <Switch
                  id="allowTeamRegistration"
                  checked={settings.allowTeamRegistration}
                  onCheckedChange={() => handleSwitchChange("allowTeamRegistration")}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxTeamSize">Maximum Team Size</Label>
                <Input
                  id="maxTeamSize"
                  name="maxTeamSize"
                  type="number"
                  min="1"
                  value={settings.maxTeamSize}
                  onChange={handleNumberInputChange}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="competition" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Competition Settings</CardTitle>
              <CardDescription>
                Configure competition-related settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="space-y-0.5">
                  <Label htmlFor="displayScoreboard">Display Scoreboard</Label>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Show the public scoreboard to all users
                  </p>
                </div>
                <Switch
                  id="displayScoreboard"
                  checked={settings.displayScoreboard}
                  onCheckedChange={() => handleSwitchChange("displayScoreboard")}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Competition Phases</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {settings.competitionPhases.map((phase: string) => (
                    <div key={phase} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-md text-sm">
                      {phase}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Competition phases can be managed in the Event Management section.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure system notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Send email notifications for important events
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={() => handleSwitchChange("emailNotifications")}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 flex justify-end">
        <Button onClick={handleSaveSettings} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
} 