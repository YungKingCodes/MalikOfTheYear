import { SidebarNav } from "@/components/ui/sidebar-nav"
import { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage the platform as an administrator",
}

const sidebarNavItems = [
  {
    title: "Overview",
    href: "/admin",
    icon: "LayoutDashboard",
  },
  {
    title: "Event Management",
    href: "/admin/event-management",
    icon: "LayoutDashboard",
  },
  {
    title: "Teams",
    href: "/admin/teams",
    icon: "Users",
  },
  {
    title: "Players",
    href: "/admin/players",
    icon: "UserCog",
  },
  {
    title: "Games",
    href: "/admin/games",
    icon: "Gamepad",
  },
  {
    title: "Competitions",
    href: "/admin/competitions",
    icon: "Trophy",
  },
  {
    title: "Feedback",
    href: "/admin/feedback",
    icon: "MessagesSquare",
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: "Settings",
  },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Server-side auth check
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/unauthorized");
  }
  
  return (
    <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
      <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
        <div className="py-6 pr-6">
          <SidebarNav items={sidebarNavItems} />
        </div>
      </aside>
      
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="outline" size="icon" className="fixed top-4 left-4 z-40">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] p-0">
          <div className="py-6 pr-6">
            <SidebarNav items={sidebarNavItems} />
          </div>
        </SheetContent>
      </Sheet>
      
      <main className="flex w-full flex-col overflow-hidden py-6 md:pl-6">{children}</main>
    </div>
  )
} 