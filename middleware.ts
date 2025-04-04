import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Define protected routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/player-profile",
  "/profile",
  "/games",
  "/teams",
  "/feedback"
]

// Define admin-only routes
const adminRoutes = ["/admin"]

// Routes that are accessible without completing registration
const publicRoutes = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/error",
  "/auth/complete-profile",
  "/api/auth/complete-profile"
]

// Middleware function that runs on every request
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for public routes and static files
  if (publicRoutes.some(route => pathname.startsWith(route)) || 
      pathname.includes('/_next') || 
      pathname.includes('/api/auth') ||
      pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)) {
    return NextResponse.next()
  }
  
  // Get the token using the JWT secret from your environment
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  })
  
  // No token means the user is not authenticated
  if (!token) {
    // Get the current URL to redirect back after login
    const redirectUrl = new URL("/auth/login", request.url)
    redirectUrl.searchParams.set("return_to", pathname)
    
    return NextResponse.redirect(redirectUrl)
  }
  
  // Check if this is the profile completion page
  if (pathname.startsWith("/auth/complete-profile")) {
    // If user is not a new user, redirect to dashboard
    if (!token.isNewUser) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    
    // Otherwise, allow access to the profile completion page
    return NextResponse.next()
  }
  
  // If user is authenticated but is a new user, redirect to complete profile
  // This ensures OAuth users must complete their profile before accessing other parts of the app
  if (token.isNewUser === true) {
    console.log("New user detected, redirecting to complete profile page");
    return NextResponse.redirect(new URL("/auth/complete-profile", request.url))
  }
  
  // Check if this is a route that needs authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
  
  if (isAdminRoute && token.role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }
  
  return NextResponse.next()
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all routes except for:
     * 1. /_next (Next.js internals)
     * 2. /_static (used for static files in Vercel)
     * 3. All static files (images, favicons, etc)
     */
    "/((?!_next|_static|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|ttf|woff|woff2)).*)",
  ],
}

