import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { authConfig } from "@/lib/auth-config";

/**
 * API endpoint to link OAuth accounts with existing email accounts
 * This helps resolve the OAuthAccountNotLinked error by creating account links
 * between providers when they share the same email address
 */
export async function POST(req: NextRequest) {
  try {
    // Get current session
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be signed in to link accounts" },
        { status: 401 }
      );
    }
    
    const { provider, providerAccountId } = await req.json();
    
    if (!provider || !providerAccountId) {
      return NextResponse.json(
        { error: "Provider and providerAccountId are required" },
        { status: 400 }
      );
    }
    
    // Find the user with this email
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { accounts: true }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Check if account link already exists
    const existingAccount = await db.account.findFirst({
      where: {
        userId: user.id,
        provider,
      }
    });
    
    // If account link already exists, return success
    if (existingAccount) {
      return NextResponse.json({ success: true, message: "Account already linked" });
    }
    
    // Create a new account link
    await db.account.create({
      data: {
        userId: user.id,
        type: "oauth",
        provider,
        providerAccountId,
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: "Account linked successfully"
    });
    
  } catch (error) {
    console.error("Error linking account:", error);
    return NextResponse.json(
      { error: "Failed to link account" },
      { status: 500 }
    );
  }
} 