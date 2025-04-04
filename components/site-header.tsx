"use client"

import Link from "next/link"
import { MainNav } from "@/components/main-nav"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Crown, MessageSquare, User } from "lucide-react"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSession, signOut } from "next-auth/react"
import * as React from "react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthLoading } from "@/app/providers"

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const isAuthLoading = useAuthLoading()
  const user = session?.user

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
  }

  // Close mobile menu when route changes (especially important for mobile)
  React.useEffect(() => {
    if (open) {
      setOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])
  
  // Close mobile menu on outside click
  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (open && !(event.target as Element).closest('[data-sheet]')) {
        setOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="mr-2 md:hidden focus:outline-none focus-visible:ring-2"
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className="pr-0 z-[100] w-[80%] sm:w-[350px] overflow-y-auto"
            onOpenAutoFocus={(e) => e.preventDefault()}
            data-sheet
          >
            <Link href="/" className="flex items-center space-x-2" onClick={() => setOpen(false)}>
              <Crown className="h-6 w-6 text-secondary" />
              <span className="font-bold text-secondary">Malik of The Year</span>
            </Link>
            <div className="grid gap-2 py-6">
              <Link
                href="/competitions"
                className={cn(
                  "flex w-full items-center py-2 text-lg font-semibold",
                  pathname === "/competitions" ? "text-primary" : "text-foreground/60",
                )}
                onClick={() => setOpen(false)}
              >
                Competitions
              </Link>
              <Link
                href="/teams"
                className={cn(
                  "flex w-full items-center py-2 text-lg font-semibold",
                  pathname === "/teams" ? "text-primary" : "text-foreground/60",
                )}
                onClick={() => setOpen(false)}
              >
                Teams
              </Link>
              <Link
                href="/players"
                className={cn(
                  "flex w-full items-center py-2 text-lg font-semibold",
                  pathname === "/players" ? "text-primary" : "text-foreground/60",
                )}
                onClick={() => setOpen(false)}
              >
                Players
              </Link>
              <Link
                href="/games"
                className={cn(
                  "flex w-full items-center py-2 text-lg font-semibold",
                  pathname === "/games" ? "text-primary" : "text-foreground/60",
                )}
                onClick={() => setOpen(false)}
              >
                Games
              </Link>
              <Link
                href="/feedback"
                className={cn(
                  "flex w-full items-center py-2 text-lg font-semibold",
                  pathname === "/feedback" ? "text-primary" : "text-foreground/60",
                )}
                onClick={() => setOpen(false)}
              >
                Feedback
              </Link>
            </div>
          </SheetContent>
        </Sheet>
        <div className="hidden md:block">
          <MainNav />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-3">
            {isAuthLoading ? (
              <div className="flex items-center space-x-3 animate-pulse">
                <div className="h-8 w-20 rounded-md bg-muted"></div>
                <div className="h-8 w-8 rounded-full bg-muted"></div>
              </div>
            ) : user ? (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/feedback" className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Feedback
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                  </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    {user.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Admin Panel</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-secondary text-secondary hover:bg-secondary/10"
                >
                  <Link href="/auth/register">Sign Up</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

