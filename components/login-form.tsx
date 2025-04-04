"use client"

import React, { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

// Types for props
interface LoginFormProps {
  searchParams?: { [key: string]: string | string[] | undefined }
}

export function LoginForm({ searchParams }: LoginFormProps) {
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
      if (errorParam === "OAuthAccountNotLinked") {
        setError("Email already used with a different sign-in method. Please contact support for assistance.")
      } else {
        setError(`Authentication error: ${errorParam}`)
      }
    }
  }, [errorParam])
  
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
        <CardDescription>Sign in with your Google account</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Button 
            type="button" 
            className="w-full" 
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
              Sign in with Google to access your account. All users begin as players.
            </p>
            <p className="mt-1">
              Team captains are determined by team voting during competitions.
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Need help? Contact your system administrator for assistance.
        </p>
      </CardFooter>
    </Card>
  )
}

