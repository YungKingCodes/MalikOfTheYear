import { auth } from "@/auth"
import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

/**
 * API route to complete user profile after OAuth sign-in
 * This creates the user record in the database
 */
export async function POST(request: NextRequest) {
  try {
    // Get the current session to validate authentication
    const session = await auth()
    
    // If not authenticated, return 401
    if (!session) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      )
    }
    
    // Parse request body
    const data = await request.json()
    const { name, email, position } = data
    
    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }
    
    // Check if email is the same as in session for security
    if (email !== session.user.email) {
      return NextResponse.json(
        { message: "Email mismatch with authenticated user" },
        { status: 403 }
      )
    }
    
    // Check if a user with this email already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })
    
    let user
    
    if (existingUser) {
      // Update the existing user with new details
      // Don't change role if they're already an admin (business rule override)
      const updatedRole = existingUser.role === "admin" ? "admin" : "player"
      
      user = await db.user.update({
        where: { id: existingUser.id },
        data: {
          name,
          // Always set role as player (unless they're an admin)
          role: updatedRole,
          position: position || null,
          // Don't include isNewUser - it's not in the database schema
          // Add any other fields from your form
        }
      })
    } else {
      // Create a new user record
      user = await db.user.create({
        data: {
          email,
          name,
          // All new users are assigned the player role
          role: "player",
          position: position || null,
          // Don't include isNewUser - it's not in the database schema
          // Add any other fields from your form
        }
      })
    }
    
    // Need to update the auth state of the current user session
    // For database strategy, this is handled by the client-side session update
    // in the complete-profile-form.tsx which calls the update() function
    
    // Return success with the user data
    return NextResponse.json({
      message: "Profile completed successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
        position: user.position,
        isNewUser: false // Mark as not a new user for client update
      }
    })
    
  } catch (error: any) {
    console.error("Error completing profile:", error)
    
    return NextResponse.json(
      { message: error.message || "An error occurred" },
      { status: 500 }
    )
  }
} 