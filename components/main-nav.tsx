"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Crown, Menu } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useSession } from "next-auth/react"

export function MainNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    user && {
      href: "/dashboard",
      label: "Dashboard",
      active: pathname === "/dashboard",
    },
    {
      href: "/competitions",
      label: "Competitions",
      active: pathname === "/competitions",
    },
    {
      href: "/teams",
      label: "Teams",
      active: pathname === "/teams",
    },
    {
      href: "/players",
      label: "Players",
      active: pathname === "/players",
    },
    {
      href: "/games",
      label: "Games",
      active: pathname === "/games",
    },
  ].filter(Boolean)

  return (
    <div className="mr-4 flex items-center">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <Crown className="h-6 w-6 text-yellow-500" />
        <span className="hidden font-bold sm:inline-block text-yellow-500">Malik of The Year</span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
        {navItems.map(
          (item) =>
            item && (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-primary",
                  item.active ? "text-primary" : "text-foreground/60",
                )}
              >
                {item.label}
              </Link>
            ),
        )}
      </nav>

      {/* Mobile Navigation - Only Visible in MainNav when SiteHeader is not present */}
      <div className="md:hidden flex-1 flex justify-end hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 p-0 focus:outline-none focus-visible:ring-2"
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className="w-[80%] sm:w-[350px] z-[100] overflow-y-auto"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="flex flex-col space-y-4 py-4">
              <Link 
                href="/" 
                className="flex items-center space-x-2 px-2" 
                onClick={() => setIsOpen(false)}
              >
                <Crown className="h-6 w-6 text-yellow-500" />
                <span className="font-bold text-yellow-500">Malik of The Year</span>
              </Link>
              <div className="border-t pt-4">
                {navItems.map(
                  (item) =>
                    item && (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center py-2 px-2 text-base font-medium transition-colors hover:text-primary",
                          item.active ? "text-primary" : "text-foreground/60",
                        )}
                      >
                        {item.label}
                      </Link>
                    ),
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

