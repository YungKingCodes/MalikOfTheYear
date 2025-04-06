import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSession } from "next-auth/react"

interface DashboardHeaderProps {
  competitionName?: string;
  competitionYear?: number;
}

export function DashboardHeader({ competitionName, competitionYear }: DashboardHeaderProps) {
  const { data: session } = useSession()
  const user = session?.user

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {competitionName ? (
            <span className="text-amber-500 font-bold">{competitionName} {competitionYear}</span>
          ) : "Dashboard"}
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name || "Guest"}!
        </p>
      </div>
      <div className="flex items-center gap-2">
        {user?.role === "admin" && (
          <Button variant="outline" asChild>
            <Link href="/admin">Admin</Link>
          </Button>
        )}
      </div>
    </div>
  )
}

