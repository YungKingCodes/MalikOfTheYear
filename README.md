## Authentication System

The application uses NextAuth.js (Auth.js) for authentication and role-based access control.

### Features

- Email/password authentication
- Google OAuth integration
- Role-based access control with admin, captain, and player roles
- Team membership control for access to team-specific resources
- Protected routes with role verification
- Session management with JWT tokens

### Environment Variables

The following environment variables need to be set:

```
NEXTAUTH_URL="http://localhost:3000"           # Your app URL
NEXTAUTH_SECRET="your-secret-key"              # A secret key for JWT
GOOGLE_CLIENT_ID="your-google-client-id"       # For Google OAuth
GOOGLE_CLIENT_SECRET="your-google-client-secret" # For Google OAuth
```

### Authentication Flow

1. Users can register with email/password or sign in with Google
2. Authentication state is managed by NextAuth.js sessions
3. JWT tokens contain user role and team membership information
4. Middleware protects routes based on authentication status
5. ProtectedRoute component controls access based on user roles and team membership

### Usage

To protect server components:

```typescript
// Inside a page.tsx file
export default function ProtectedPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "captain"]}>
      {/* Your protected content */}
    </ProtectedRoute>
  )
}
```

To access auth in client components:

```typescript
"use client"
import { useSession } from "next-auth/react"

export function ClientComponent() {
  const { data: session, status } = useSession()
  
  if (status === "loading") {
    return <div>Loading...</div>
  }
  
  if (status === "unauthenticated") {
    return <div>Please sign in</div>
  }
  
  return <div>Welcome, {session?.user?.name}</div>
}
```

# Malik of The Year

## Google OAuth Setup

To enable Google OAuth login in this application, follow these steps:

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on "Select a project" at the top, then click "New Project"
3. Enter a name for your project and click "Create"
4. Select your new project

### 2. Configure OAuth Consent Screen

1. In the left sidebar, go to "APIs & Services" > "OAuth consent screen"
2. Select "External" as the user type (unless you're within an organization)
3. Fill in the required fields:
   - App name: "Malik of The Year"
   - User support email: Your email address
   - Developer contact information: Your email address
4. Click "Save and Continue"
5. You can skip adding scopes for now - click "Save and Continue"
6. Add any test users if needed, then click "Save and Continue"
7. Review your settings and click "Back to Dashboard"

### 3. Create OAuth Credentials

1. In the left sidebar, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Name: "Malik of The Year Web Client"
5. Add these Authorized JavaScript origins:
   - `http://localhost:3000` (for local development)
   - Your production URL if deployed
6. Add these Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for local development)
   - `YOUR_PRODUCTION_URL/api/auth/callback/google` (if deployed)
7. Click "Create"
8. You'll see a popup with your Client ID and Client Secret - copy these values

### 4. Update Environment Variables

1. Update your `.env.local` file with:
   ```
   GOOGLE_CLIENT_ID=your-client-id-here
   GOOGLE_CLIENT_SECRET=your-client-secret-here
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secure-secret-string
   ```

2. If deploying to production, make sure to set these variables in your hosting environment with the production URL.

### 5. Verify OAuth is Working

1. Run the OAuth configuration verification tool:
   ```bash
   npm run verify:oauth
   ```

2. Start your application locally:
   ```bash
   npm run dev
   ```

3. Test your OAuth callback configuration:
   ```bash
   npm run test:oauth-callback
   ```

4. Visit the OAuth debug page at [http://localhost:3000/debug/oauth](http://localhost:3000/debug/oauth) to check your configuration status

5. Try signing in with Google by visiting the login page and clicking "Sign in with Google"

### Debugging OAuth Issues

If you encounter issues with Google OAuth, this project includes several debugging tools:

1. **OAuth Status Page**: Visit `/debug/oauth` in your browser to see a comprehensive status page showing:
   - Environment variable configuration
   - Session status
   - Connection information

2. **Verification Scripts**:
   - `npm run verify:oauth` - Checks your environment variables and OAuth configuration
   - `npm run test:oauth-callback` - Tests your callback URL configuration

3. **API Endpoints**:
   - `/api/auth/test-env` - Shows environment variable status
   - `/api/auth/debug` - Provides detailed debugging information

4. **Documentation**:
   - See `OAUTH_TROUBLESHOOTING.md` for a comprehensive troubleshooting guide

For more detailed troubleshooting, refer to the [troubleshooting guide](OAUTH_TROUBLESHOOTING.md).

### Common OAuth Issues

- **Redirect URI Mismatch**: Ensure your authorized redirect URI in Google Cloud Console exactly matches `http://localhost:3000/api/auth/callback/google`
- **OAuth Consent Screen**: If in "Testing" mode, your email must be added as a test user
- **Environment Variables**: Make sure all required variables are set in `.env.local`
- **Browser Cookies**: Try clearing cookies if you encounter persistent issues
- **Connection Issues**: Verify that `NEXTAUTH_URL` matches the URL your application is running on 