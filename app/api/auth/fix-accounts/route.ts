import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Admin endpoint to fix account linking issues
 * This should be protected in production but can be used during development
 * to resolve the OAuthAccountNotLinked error
 */
export async function POST(req: NextRequest) {
  try {
    // Get the email from the request body
    const { email, provider, providerAccountId } = await req.json();
    
    if (!email || !provider || !providerAccountId) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields: email, provider, providerAccountId" 
      }, { status: 400 });
    }
    
    // Find the user with this email
    const user = await db.user.findUnique({
      where: { email },
      include: { accounts: true }
    });
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: "User not found" 
      }, { status: 404 });
    }
    
    // Check if this account link already exists
    const existingAccount = await db.account.findFirst({
      where: {
        provider,
        providerAccountId
      }
    });
    
    if (existingAccount) {
      // Already exists, let's update it
      await db.account.update({
        where: { id: existingAccount.id },
        data: { userId: user.id }
      });
      
      return NextResponse.json({ 
        success: true, 
        message: "Account link updated successfully" 
      });
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
      message: "Account link created successfully" 
    });
    
  } catch (error) {
    console.error("Error fixing account:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fix account" 
    }, { status: 500 });
  }
} 