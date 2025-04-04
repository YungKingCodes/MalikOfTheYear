"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSession } from "next-auth/react"

export interface CompleteProfileFormProps {
  initialEmail?: string
  initialName?: string
}

export function CompleteProfileForm({ initialEmail = "", initialName = "" }: CompleteProfileFormProps) {
  const [name, setName] = useState(initialName)
  const [email] = useState(initialEmail) // Email is read-only from Google
  const [position, setPosition] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { update } = useSession()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Basic validation
    if (!name) {
      setError("Name is required")
      setLoading(false)
      return
    }

    try {
      // Call the API to create a user record
      const response = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          email,
          role: "player", // All new users are players by default
          position: position || undefined,
          // Include other fields you want to collect
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to complete profile")
      }

      // Update the user session to reflect new details
      await update({
        ...data.user,
        isNewUser: false
      })

      // Redirect to dashboard
      router.push("/dashboard")
      
    } catch (err: any) {
      setError(err.message || "An error occurred while completing your profile")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
        <CardDescription>
          Just a few more details to get you started with Malik of The Year
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">Email from your Google account (cannot be changed)</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="position">Position (Optional)</Label>
            <Input
              id="position"
              type="text"
              placeholder="Your preferred position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            />
          </div>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>By signing up, you'll be registered as a player. Team captains are determined by team voting.</p>
          </div>
          
          {/* You can add more fields here as needed */}
          
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 shadow-md" 
            disabled={loading}
          >
            {loading ? "Completing Profile..." : "Complete Profile"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        Your profile info helps us provide a better experience
      </CardFooter>
    </Card>
  )
} 