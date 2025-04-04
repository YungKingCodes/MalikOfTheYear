import { Button } from "@/components/ui/button"
import { Crown } from "lucide-react"

export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Crown className="h-6 w-6 text-secondary" />
          <h1 className="text-2xl font-bold tracking-tight text-secondary">Eid-Al-Athletes 2025</h1>
        </div>
        <p className="text-muted-foreground">Welcome to your competition dashboard. Track teams, players, and games.</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" className="border-secondary/50 text-secondary hover:bg-secondary/10">
          Export Data
        </Button>
        <Button className="bg-primary hover:bg-primary/90">Add Event</Button>
      </div>
    </div>
  )
}

