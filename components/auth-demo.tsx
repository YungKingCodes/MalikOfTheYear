"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession, signOut, signIn } from "next-auth/react"
import { useState } from "react"

export function AuthDemo() {
  const { data: session, status } = useSession()
  const user = session?.user
  const [expanded, setExpanded] = useState(false)

  // Note: In a real app, you'd implement these using proper auth flows
  // These demo logins are for illustration purposes only.
  // We're using signIn with credentials, but the real login would be through the login page
  const loginAsAdmin = async () => {
    await signIn('credentials', {
      email: 'admin@example.com',
      password: 'admin123',
      redirect: false
    })
  }

  const loginAsCaptain = async () => {
    await signIn('credentials', {
      email: 'captain@example.com',
      password: 'captain123',
      redirect: false
    })
  }

  const loginAsPlayer = async () => {
    await signIn('credentials', {
      email: 'player@example.com',
      password: 'player123',
      redirect: false
    })
  }

  const handleLogout = () => {
    signOut({ redirect: false });
  }

  if (!expanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button onClick={() => setExpanded(true)} variant="outline" className="shadow-md">
          {user ? `Logged in as ${user.role}` : "Login Demo"}
        </Button>
      </div>
    )
  }

  const isLoading = status === "loading"

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Authentication Demo</CardTitle>
          <CardDescription>Login with different roles to see how player scores visibility changes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            </div>
          ) : user ? (
            <div className="p-2 bg-muted rounded-md">
              <p className="font-medium">Logged in as: {user.name}</p>
              <p>Role: {user.role}</p>
              {user.teamId && <p>Team ID: {user.teamId}</p>}
            </div>
          ) : (
            <p>Not logged in</p>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2 pt-0">
          <Button size="sm" onClick={loginAsAdmin} variant="outline" disabled={isLoading}>
            Admin
          </Button>
          <Button size="sm" onClick={loginAsCaptain} variant="outline" disabled={isLoading}>
            Captain
          </Button>
          <Button size="sm" onClick={loginAsPlayer} variant="outline" disabled={isLoading}>
            Player
          </Button>
          {user && (
            <Button size="sm" onClick={handleLogout} variant="destructive" disabled={isLoading}>
              Logout
            </Button>
          )}
          <Button size="sm" onClick={() => setExpanded(false)} variant="secondary" className="w-full mt-1">
            Minimize
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

