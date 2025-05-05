"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LucideIcon, Gauge, Calendar, Settings, MessagesSquare, Users, Trophy, Gamepad, LayoutDashboard, UserCog } from "lucide-react"

interface SidebarNavItem {
  title: string
  href: string
  icon?: string
  disabled?: boolean
  external?: boolean
}

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: SidebarNavItem[]
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname()

  // Map string icon names to actual Lucide components
  const getIconComponent = (iconName?: string) => {
    if (!iconName) return null
    
    switch (iconName) {
      case "Gauge":
        return Gauge
      case "Calendar":
        return Calendar
      case "Settings":
        return Settings
      case "MessagesSquare":
        return MessagesSquare
      case "Users":
        return Users
      case "Trophy":
        return Trophy
      case "GamepadIcon":
      case "Gamepad":
        return Gamepad
      case "Dashboard":
      case "LayoutDashboard":
        return LayoutDashboard
      case "UserCog":
        return UserCog
      default:
        return null
    }
  }

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className
      )}
      {...props}
    >
      {items.map((item) => {
        const IconComponent = getIconComponent(item.icon)
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              pathname === item.href
                ? "bg-accent text-accent-foreground"
                : "transparent",
              item.disabled && "pointer-events-none opacity-60"
            )}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noreferrer" : undefined}
          >
            {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
            <span>{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
} 