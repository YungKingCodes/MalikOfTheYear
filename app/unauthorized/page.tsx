import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Unauthorized | Malik of The Year",
  description: "You don't have permission to access this page",
}

export default function UnauthorizedPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this page
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p>
            This area is restricted to users with specific permissions. 
            If you believe you should have access, please contact an administrator.
          </p>
          
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
            <p>
              <strong>Note:</strong> Different sections of the application require different 
              roles or team memberships. Your current role doesn't permit access to this page.
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="space-x-4">
          <Button asChild variant="outline">
            <Link href="/">Return to Home</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 