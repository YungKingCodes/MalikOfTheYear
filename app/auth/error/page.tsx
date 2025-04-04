"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The verification link may have been used or is no longer valid.",
  OAuthSignin: "Could not initiate OAuth sign-in.",
  OAuthCallback: "Error occurred during OAuth callback.",
  OAuthCreateAccount: "Could not create OAuth account.",
  EmailCreateAccount: "Could not create email account.",
  Callback: "Error occurred during callback processing.",
  OAuthAccountNotLinked: "This email is already associated with another account.",
  EmailSignin: "The e-mail could not be sent.",
  CredentialsSignin: "Sign in failed. Check your credentials.",
  SessionRequired: "Please sign in to access this page.",
  Default: "An unknown error occurred during authentication.",
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const errorMessage = errorParam 
    ? (ERROR_MESSAGES[errorParam] || ERROR_MESSAGES.Default) 
    : ERROR_MESSAGES.Default;

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Authentication Error</CardTitle>
          <CardDescription>There was a problem signing you in</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              {errorMessage}
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4 text-sm">
            <h3 className="font-medium">Troubleshooting:</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Check your credentials and try again</li>
              <li>Make sure you're using the correct social account</li>
              <li>If using Google, ensure you've granted the necessary permissions</li>
              <li>Clear your browser cookies and try again</li>
              <li>Contact support if this issue persists</li>
            </ul>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/login">Try Again</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Please wait</CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
} 