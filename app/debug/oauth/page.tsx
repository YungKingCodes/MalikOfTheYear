import { OAuthStatus } from "@/components/debug/oauth-status";

export const metadata = {
  title: "OAuth Debug - Malik of the Year",
  description: "Debug page for OAuth configuration"
};

export default function OAuthDebugPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">OAuth Configuration Debug</h1>
      <div className="mb-8">
        <p className="text-center text-muted-foreground max-w-xl mx-auto">
          This page helps you debug OAuth configuration issues. 
          It displays your current environment setup, session status, and connection information.
        </p>
      </div>
      
      <div className="mb-8">
        <OAuthStatus />
      </div>
      
      <div className="max-w-md mx-auto space-y-4">
        <h2 className="text-xl font-semibold">Quick Troubleshooting Tips</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Make sure your <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> are correctly set in <code>.env.local</code></li>
          <li>Ensure the redirect URI in Google Cloud Console exactly matches <code>http://localhost:3000/api/auth/callback/google</code></li>
          <li>Check that your OAuth consent screen is properly configured</li>
          <li>Try clearing your browser cookies if you encounter persistent issues</li>
          <li>Make sure your application is running on the URL specified in <code>NEXTAUTH_URL</code></li>
        </ul>
        
        <div className="pt-4">
          <p>For more detailed troubleshooting, see the <a href="/OAUTH_TROUBLESHOOTING.md" className="text-blue-600 hover:underline">OAuth Troubleshooting Guide</a>.</p>
        </div>
      </div>
    </div>
  );
} 