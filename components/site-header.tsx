"use client"

import Link from "next/link"
import { MainNav } from "@/components/main-nav"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Crown, MessageSquare, User } from "lucide-react"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useSession, signOut, signIn } from "next-auth/react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const isAuthLoading = useAuthLoading()
  const user = session?.user
  const [showSignUpDialog, setShowSignUpDialog] = useState(false)

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  // Handle direct sign up with Google
  const handleGoogleSignUp = async () => {
    await signIn("google", { callbackUrl: "/dashboard" })
  }

  // Open the sign up dialog
  const openSignUpDialog = () => {
    setShowSignUpDialog(true)
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
    <>
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
                {user && (
                  <Link
                    href="/dashboard"
                    className={cn(
                      "flex w-full items-center py-2 text-lg font-semibold",
                      pathname === "/dashboard" ? "text-primary" : "text-foreground/60",
                    )}
                    onClick={() => setOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
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
                
                {/* Authentication options for mobile menu */}
                {!user && (
                  <div className="flex flex-col space-y-2 pt-4 border-t mt-2">
                    <Link 
                      href="/auth/login" 
                      className="flex items-center py-2 text-lg font-semibold text-foreground/60 hover:text-primary"
                      onClick={() => setOpen(false)}
                    >
                      Sign In
                    </Link>
                    <button 
                      onClick={() => {
                        setOpen(false);
                        setShowSignUpDialog(true);
                      }}
                      className="flex items-center py-2 text-lg font-semibold text-foreground/60 hover:text-primary text-left"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
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
                    onClick={openSignUpDialog}
                    variant="outline"
                    size="sm"
                    className="border-secondary text-secondary hover:bg-secondary/10"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Sign Up Dialog */}
      <Dialog open={showSignUpDialog} onOpenChange={setShowSignUpDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign Up with Google</DialogTitle>
            <DialogDescription>
              Creating an account for Malik of The Year is quick and easy with Google.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4 py-4">
            <p>By continuing, you will:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Create a new account using your Google profile</li>
              <li>Start with the "Player" role</li>
              <li>Be able to join competitions and teams</li>
            </ul>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button variant="outline" onClick={() => setShowSignUpDialog(false)}>Cancel</Button>
            <Button onClick={handleGoogleSignUp} className="bg-primary hover:bg-primary/90">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign Up with Google
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

