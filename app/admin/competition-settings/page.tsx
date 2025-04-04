"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { CompetitionPhaseManager } from "@/components/admin/competition-phase-manager"
import { TeamCaptainOverride } from "@/components/admin/team-captain-override"

export default function CompetitionSettingsPage() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Settings saved",
      description: "Your competition settings have been updated successfully.",
    })

    setIsSaving(false)
  }

  return (
    <div className="container py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button variant="outline" size="sm" asChild className="mb-2">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Competition Settings</h1>
          <p className="text-muted-foreground">Manage deadlines, teams, and competition parameters</p>
        </div>

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="phases" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="phases">Phases</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="captains">Captains</TabsTrigger>
          <TabsTrigger value="games">Games</TabsTrigger>
        </TabsList>

        <TabsContent value="phases" className="space-y-6">
          <CompetitionPhaseManager />
        </TabsContent>

        <TabsContent value="teams" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>Configure teams and player assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6">
                Manage team formation, edit team details, and override player assignments.
              </p>

              {/* Placeholder for team management component */}
              <div className="space-y-4 border rounded-md p-4">
                <p className="text-center text-muted-foreground py-8">
                  Team management component will be implemented here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="captains" className="space-y-6">
          <TeamCaptainOverride />
        </TabsContent>

        <TabsContent value="games" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Game Configuration</CardTitle>
              <CardDescription>Manage game types, schedules, and rules</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6">
                Configure the games that will be part of the competition, set schedules, and define rules.
              </p>

              {/* Placeholder for game configuration component */}
              <div className="space-y-4 border rounded-md p-4">
                <p className="text-center text-muted-foreground py-8">
                  Game configuration component will be implemented here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

