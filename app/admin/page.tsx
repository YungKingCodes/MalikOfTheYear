import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, Users, Trophy, Activity, Settings, PieChart, Gamepad } from "lucide-react"

export const metadata = {
  title: "Admin Dashboard",
  description: "Manage competitions, teams, and games"
}

export default async function AdminDashboardPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin")
  }
  
  if (session.user.role !== "admin") {
    notFound()
  }
  
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your competitions, teams, and games</p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Trophy className="h-5 w-5 text-primary mr-2" />
              Competitions
            </CardTitle>
            <CardDescription>Manage your competitions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <Button asChild variant="outline" size="sm" className="justify-start">
                  <Link href="/admin/competitions">
                    <PieChart className="h-4 w-4 mr-2" />
                    View All Competitions
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="justify-start">
                  <Link href="/admin/competitions/new">
                    <Trophy className="h-4 w-4 mr-2" />
                    Create New Competition
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Gamepad className="h-5 w-5 text-primary mr-2" />
              Games
            </CardTitle>
            <CardDescription>Manage your games</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <Button asChild variant="outline" size="sm" className="justify-start">
                  <Link href="/admin/games">
                    <Gamepad className="h-4 w-4 mr-2" />
                    Manage Games
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 text-primary mr-2" />
              Teams
            </CardTitle>
            <CardDescription>Manage your teams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <Button asChild variant="outline" size="sm" className="justify-start">
                  <Link href="/admin/teams">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Teams
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 text-primary mr-2" />
              Settings
            </CardTitle>
            <CardDescription>Manage application settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <Button asChild variant="outline" size="sm" className="justify-start">
                  <Link href="/admin/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Application Settings
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 