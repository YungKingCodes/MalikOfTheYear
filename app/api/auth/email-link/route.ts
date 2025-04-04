import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * This is a custom workaround for the OAuthAccountNotLinked error.
 * 
 * If a user tries to sign in with Google but already has an account with the same email,
 * they will get redirected here. This endpoint will look up the account by email,
 * and redirect them to the appropriate place with helpful messaging.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    
    if (!email) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/auth/error?error=MissingEmail`
      );
    }
    
    // Look up the user
    const user = await db.user.findUnique({
      where: { email },
      include: {
        accounts: true
      }
    });
    
    if (!user) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/auth/error?error=UserNotFound`
      );
    }
    
    // Check if this user already has any accounts linked
    if (user.accounts && user.accounts.length > 0) {
      // User already has at least one account linked
      console.log(`User ${email} already has ${user.accounts.length} linked accounts`);
      
      // Check if one of those accounts is Google
      const googleAccount = user.accounts.find(acct => acct.provider === "google");
      
      if (googleAccount) {
        console.log(`User ${email} already has a Google account linked`);
        // They already have a Google account, so this is a different issue
        return NextResponse.redirect(
          `${process.env.NEXTAUTH_URL}/auth/error?error=AccountConflict`
        );
      }
      
      // They have accounts but not Google, so direct them to login
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/auth/login?error=UseExistingMethod`
      );
    }
    
    // If we get here, the user has no accounts linked at all
    console.log(`User ${email} has no linked accounts. Redirecting to login.`);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/auth/login?email=${encodeURIComponent(email)}`
    );
  } catch (error) {
    console.error("Error in email-link route:", error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/auth/error?error=ServerError`
    );
  }
} 