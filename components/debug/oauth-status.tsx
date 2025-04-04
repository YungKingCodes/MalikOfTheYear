"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, AlertCircle, Info } from "lucide-react";

/**
 * OAuthStatus Component
 * 
 * A debug component that displays the current OAuth configuration and connection status.
 * Only use in development environments!
 */
export function OAuthStatus() {
  const { data: session, status } = useSession();
  const [envStatus, setEnvStatus] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkEnvStatus = async () => {
      try {
        const response = await fetch('/api/auth/test-env');
        if (response.ok) {
          const data = await response.json();
          setEnvStatus(data.env || {});
        }
      } catch (error) {
        console.error("Failed to fetch env status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkEnvStatus();
  }, []);

  const renderEnvVariable = (name: string, description: string) => {
    const isConfigured = envStatus[name];
    
    return (
      <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <Badge variant={isConfigured ? "success" : "destructive"}>
          {isConfigured ? (
            <><Check className="mr-1 h-3 w-3" /> Configured</>
          ) : (
            <><AlertCircle className="mr-1 h-3 w-3" /> Missing</>
          )}
        </Badge>
      </div>
    );
  };

  const renderSessionStatus = () => {
    if (status === "loading") return <p>Loading session...</p>;
    
    if (status === "authenticated") {
      return (
        <div className="space-y-2">
          <Badge variant="success"><Check className="mr-1 h-3 w-3" /> Authenticated</Badge>
          <p className="text-sm">Signed in as: <span className="font-medium">{session.user?.email}</span></p>
          {session.user?.image && (
            <div className="flex items-center space-x-2">
              <p className="text-sm">Profile image:</p>
              <img 
                src={session.user.image} 
                alt={session.user?.name || "User"} 
                className="w-8 h-8 rounded-full"
              />
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <Badge variant="secondary">Not Authenticated</Badge>
        <p className="text-sm">You are not currently signed in.</p>
      </div>
    );
  };

  if (process.env.NODE_ENV === "production") {
    return null; // Don't render in production
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Info className="mr-2 h-5 w-5" />
          OAuth Debug Status
        </CardTitle>
        <CardDescription>
          Check your OAuth configuration status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Environment Variables</h3>
          {isLoading ? (
            <p>Loading configuration status...</p>
          ) : (
            <div className="space-y-2">
              {renderEnvVariable("GOOGLE_CLIENT_ID", "Google OAuth Client ID")}
              {renderEnvVariable("GOOGLE_CLIENT_SECRET", "Google OAuth Client Secret")}
              {renderEnvVariable("NEXTAUTH_URL", "NextAuth Base URL")}
              {renderEnvVariable("NEXTAUTH_SECRET", "NextAuth Secret Key")}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-semibold mb-2">Session Status</h3>
          {renderSessionStatus()}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" asChild>
          <a href="/api/auth/debug" target="_blank" rel="noopener noreferrer">
            View Debug Info
          </a>
        </Button>
        <Button variant="default" size="sm" asChild>
          <a href="/auth/login">
            Go to Login
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
} 