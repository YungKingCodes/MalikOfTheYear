"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";

/**
 * Auth error page component
 * Handles different authentication error scenarios with user-friendly guidance
 */
export default function AuthErrorPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  // Extract the error code from the URL
  const errorType = searchParams?.error as string;
  
  // Default error message and title
  let title = "Authentication Error";
  let description = "An error occurred during authentication.";
  let action = (
    <>
      <Button variant="outline" asChild className="mr-2">
        <Link href="/">Back to Home</Link>
      </Button>
      <Button asChild>
        <Link href="/auth/login">Back to Login</Link>
      </Button>
    </>
  );
  
  // Custom error messages based on error type
  if (errorType === "OAuthAccountNotLinked") {
    title = "Account Already Exists";
    description = "An account with this email already exists but with a different sign-in method. If this is your account, please sign in using your existing method (email/password) first.";
    action = (
      <>
        <Button variant="outline" asChild className="mr-2">
          <Link href="/">Back to Home</Link>
        </Button>
        <Button asChild>
          <Link href="/auth/login">Sign in with Email</Link>
        </Button>
      </>
    );
  } else if (errorType === "AccessDenied") {
    title = "Access Denied";
    description = "You don't have permission to access this resource.";
  } else if (errorType === "Verification") {
    title = "Verification Failed";
    description = "The verification link is invalid or has expired.";
  } else if (errorType === "Configuration") {
    title = "Server Configuration Error";
    description = "There is an issue with the server configuration. Please contact support.";
  }
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <AlertTriangle size={24} />
              </div>
            </div>
            <CardTitle className="text-center">{title}</CardTitle>
            <CardDescription className="text-center">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Error code: {errorType || "unknown"}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            {action}
          </CardFooter>
        </Card>
      </div>
    </Suspense>
  );
} 