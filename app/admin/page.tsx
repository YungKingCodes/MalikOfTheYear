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
    <div className="container py-4 md:py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage your competitions, teams, and games</p>
        </div>
      </div>
      
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="h-full">
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="flex items-center text-lg md:text-xl">
              <Trophy className="h-4 w-4 md:h-5 md:w-5 text-primary mr-2" />
              Competitions
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Manage your competitions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 md:space-y-4">
              <div className="grid grid-cols-1 gap-2 md:gap-3">
                <Button asChild variant="outline" size="sm" className="justify-start text-sm">
                  <Link href="/admin/competitions">
                    <PieChart className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                    View All Competitions
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="justify-start text-sm">
                  <Link href="/admin/competitions/new">
                    <Trophy className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                    Create New Competition
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="h-full">
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="flex items-center text-lg md:text-xl">
              <Gamepad className="h-4 w-4 md:h-5 md:w-5 text-primary mr-2" />
              Games
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Manage your games</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 md:space-y-4">
              <div className="grid grid-cols-1 gap-2 md:gap-3">
                <Button asChild variant="outline" size="sm" className="justify-start text-sm">
                  <Link href="/admin/games">
                    <Gamepad className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                    Manage Games
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="h-full">
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="flex items-center text-lg md:text-xl">
              <Users className="h-4 w-4 md:h-5 md:w-5 text-primary mr-2" />
              Teams
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Manage your teams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 md:space-y-4">
              <div className="grid grid-cols-1 gap-2 md:gap-3">
                <Button asChild variant="outline" size="sm" className="justify-start text-sm">
                  <Link href="/admin/teams">
                    <Users className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                    Manage Teams
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="justify-start text-sm">
                  <Link href="/admin/player-scores">
                    <Activity className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                    Player Scores
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="h-full">
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="flex items-center text-lg md:text-xl">
              <Settings className="h-4 w-4 md:h-5 md:w-5 text-primary mr-2" />
              Settings
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Manage application settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 md:space-y-4">
              <div className="grid grid-cols-1 gap-2 md:gap-3">
                <Button asChild variant="outline" size="sm" className="justify-start text-sm">
                  <Link href="/admin/settings">
                    <Settings className="h-3 w-3 md:h-4 md:w-4 mr-2" />
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