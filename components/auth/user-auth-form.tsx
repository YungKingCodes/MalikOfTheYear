"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function UserAuthForm() {
  const { data: session, status } = useSession()
  
  if (status === "loading") {
    return (
      <div className="flex justify-center my-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  if (status === "unauthenticated" || !session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Not Signed In</CardTitle>
          <CardDescription>Please sign in to view your profile</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="w-full" asChild>
            <a href="/auth/login">Sign In</a>
          </Button>
        </CardFooter>
      </Card>
    )
  }
  
  const { user } = session
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "U"
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={user.image || ""} alt={user.name || "User"} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{user.name}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="font-medium">Role</div>
          <div className="capitalize">{user.role || "Player"}</div>
          
          {user.teamId && (
            <>
              <div className="font-medium">Team</div>
              <div>{user.teamId}</div>
            </>
          )}
          
          <div className="font-medium">User ID</div>
          <div className="truncate">{user.id}</div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="destructive" 
          className="w-full" 
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Sign Out
        </Button>
      </CardFooter>
    </Card>
  )
} 