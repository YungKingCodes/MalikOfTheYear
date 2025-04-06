import { SidebarNav } from "@/components/ui/sidebar-nav"
import { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/auth"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage the platform as an administrator",
}

const sidebarNavItems = [
  {
    title: "Overview",
    href: "/admin",
    icon: "Gauge",
  },
  {
    title: "Event Management",
    href: "/admin/event-management",
    icon: "Calendar",
  },
  {
    title: "Teams",
    href: "/admin/teams",
    icon: "Users",
  },
  {
    title: "Games",
    href: "/admin/games",
    icon: "GamepadIcon",
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
      <main className="flex w-full flex-col overflow-hidden py-6">{children}</main>
    </div>
  )
} 