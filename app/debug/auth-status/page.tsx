"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AuthStatusPage() {
  const { data: session, status } = useSession();
  const [tokenData, setTokenData] = useState<any>(null);
  const [envVars, setEnvVars] = useState<string[]>([]);

  // Fetch token data
  const fetchToken = async () => {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      setTokenData(data);
    } catch (error) {
      console.error("Error fetching token:", error);
      setTokenData({ error: "Failed to fetch token data" });
    }
  };

  // Check for environment variables on client side
  useEffect(() => {
    // Only checking if they're defined, not the actual values
    const vars = [
      "NEXTAUTH_URL",
      "NEXTAUTH_SECRET",
      "GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET"
    ];
    
    const definedVars = vars.filter(v => 
      typeof process !== "undefined" && 
      process.env && 
      process.env[v] !== undefined
    );
    
    setEnvVars(definedVars);
    
    // Fetch token data on mount
    fetchToken();
  }, []);

  return (
    <div className="container max-w-3xl py-8">
      <h1 className="text-3xl font-bold mb-6">Authentication Debug</h1>
      
      <Alert className={status === "authenticated" ? "bg-green-50 border-green-200 mb-6" : "mb-6"}>
        <AlertDescription className="flex items-center justify-between">
          <span>
            <strong>Status:</strong> {status}
            {status === "authenticated" && " ✅"}
          </span>
          {status === "authenticated" && (
            <Button onClick={() => signOut()} variant="destructive" size="sm">
              Sign Out
            </Button>
          )}
        </AlertDescription>
      </Alert>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Session & Token Data</CardTitle>
          <CardDescription>
            Current authentication information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Session Data:</h3>
            <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto max-h-60">
              {JSON.stringify(session, null, 2) || "No session data"}
            </pre>
          </div>
          
          {tokenData && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Token Data:</h3>
              <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto max-h-60">
                {JSON.stringify(tokenData, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={fetchToken} variant="outline">
            Refresh Token Data
          </Button>
        </CardFooter>
      </Card>
      
      {status !== "authenticated" && (
        <Card>
          <CardHeader>
            <CardTitle>Sign In Options</CardTitle>
            <CardDescription>
              Choose an authentication method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <Button onClick={() => signIn("google")} className="w-full">
                Sign in with Google
              </Button>
              <Button onClick={() => signIn("credentials")} variant="outline" className="w-full">
                Sign in with Credentials
              </Button>
              
              <Alert className="mt-4">
                <AlertDescription>
                  <strong>Test Credentials:</strong><br/>
                  Email: admin@example.com<br/>
                  Password: password123
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 