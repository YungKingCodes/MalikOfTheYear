"use client"

import React, { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

// Types for props
interface LoginFormProps {
  searchParams?: { [key: string]: string | string[] | undefined }
}

export function LoginForm({ searchParams }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()
  const queryParams = useSearchParams()
  
  // Extract return_to and error from URL params
  const returnToParam = searchParams?.return_to || queryParams.get("return_to")
  const errorParam = searchParams?.error || queryParams.get("error")
  
  // Normalize return_to parameter to handle both string and array
  const getReturnTo = (): string => {
    if (typeof returnToParam === "string") {
      return returnToParam
    }
    if (Array.isArray(returnToParam) && returnToParam.length > 0) {
      return returnToParam[0]
    }
    return "/dashboard"
  }
  
  // Set initial error message from URL
  React.useEffect(() => {
    if (errorParam) {
      if (errorParam === "CredentialsSignin") {
        setError("Invalid email or password")
      } else if (errorParam === "OAuthAccountNotLinked") {
        setError("Email already used with a different provider. Try another sign-in method.")
      } else {
        setError(`Authentication error: ${errorParam}`)
      }
    }
  }, [errorParam])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      
      if (result?.error) {
        setError(
          result.error === "CredentialsSignin" 
            ? "Invalid email or password" 
            : result.error
        )
        setLoading(false)
        return
      }
      
      // Success - redirect
      router.push(getReturnTo())
    } catch (err) {
      setError("An error occurred during login")
      console.error(err)
      setLoading(false)
    }
  }
  
  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      // With database strategy in place, we can rely on middleware and callbacks
      // to properly redirect new users to the profile completion page
      await signIn("google", {
        callbackUrl: getReturnTo(),
      })
    } catch (err) {
      setError("An error occurred during Google login")
      console.error(err)
      setLoading(false)
    }
  }
  
  return (
    <Card className="w-full max-w-md mx-auto animate-in fade-in-50 duration-500">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 shadow-md" 
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          
          <div className="relative my-4">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              OR
            </span>
          </div>
          
          <Button 
            type="button" 
            className="w-full" 
            variant="outline" 
            onClick={handleGoogleLogin}
            disabled={loading}
          >
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
            Sign in with Google
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Sign in with Google to create an account automatically. All users begin as players.
            </p>
            <p className="mt-1">
              Team captains are determined by team voting during competitions.
            </p>
          </div>
        </form>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-2">
        <p className="text-sm text-center text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/auth/register" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

