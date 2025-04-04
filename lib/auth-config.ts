import { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { PrismaAdapter } from "@auth/prisma-adapter";

// Declare custom types for proper type checking
declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name?: string;
    role?: string;
    teamId?: string;
    isNewUser?: boolean;
  }
  
  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
    teamId?: string;
    isNewUser?: boolean;
  }
}

// Create a custom adapter by extending the PrismaAdapter
const customPrismaAdapter = Object.assign({}, PrismaAdapter(db), {
  createUser: async (data: any) => {
    // Remove isNewUser and id from data before passing to Prisma
    // MongoDB requires ObjectIDs which are not compatible with UUIDs that have hyphens
    const { isNewUser, id, ...userData } = data;
    
    // Create the user without the isNewUser field and without the id
    // Let MongoDB generate its own ObjectID
    return db.user.create({ 
      data: userData
    });
  },
  
  // Override the linkAccount function to properly handle Google accounts
  linkAccount: async (account: any) => {
    try {
      // First check if user exists by email to ensure correct linking
      const provider = account.provider;
      const email = account.email || "";
      
      // Get the user from the userId on the account
      const user = await db.user.findUnique({
        where: { id: account.userId }
      });
      
      if (!user) {
        console.error("User not found when linking account");
        throw new Error("User not found");
      }
      
      // Check if this account already exists
      const existingAccount = await db.account.findFirst({
        where: {
          provider,
          providerAccountId: account.providerAccountId
        }
      });
      
      if (existingAccount) {
        console.log("Account already exists");
        return existingAccount;
      }
      
      // Strip out the id field since MongoDB will generate its own
      const { id, ...accountData } = account;
      
      // Link the account
      console.log(`Linking ${provider} account to user ${user.email}`);
      
      return await db.account.create({
        data: accountData
      });
    } catch (error) {
      console.error("Error in linkAccount:", error);
      throw error;
    }
  }
});

/**
 * Configure NextAuth with custom settings
 */
export const authConfig: NextAuthConfig = {
  // Use custom Prisma adapter for database session storage
  adapter: customPrismaAdapter,
  
  // Next.js 14 way to enable account linking by email
  experimental: {
    // This allows linking accounts with the same email across providers
    // Similar to allowDangerousEmailAccountLinking in older versions
    enableWebAuthn: true
  },
  
  // Specify custom pages
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
    newUser: "/auth/complete-profile", // Redirect new users here
  },
  
  // Use database strategy for session management
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Configure callbacks
  callbacks: {
    // Check if user is logged in for middleware
    authorized({ auth }) {
      return !!auth?.user;
    },
    
    // Handle sign in with OAuth providers
    async signIn({ user, account, profile }) {
      // Special handling for Google sign-ins
      if (account?.provider === "google") {
        try {
          // Check if this user already exists in our database
          const existingUser = await db.user.findUnique({
            where: { email: user.email! }
          });

          if (!existingUser) {
            // Set isNewUser flag for session only, don't store in database
            // This flag will be used by callbacks but not saved to database
            user.isNewUser = true;
            return true;
          }
          
          // Update user fields from existing DB record
          user.id = existingUser.id;
          user.role = existingUser.role ?? "player"; // Default to player if no role
          user.teamId = existingUser.teamId ?? undefined;
          user.isNewUser = false;
        } catch (error) {
          console.error("Error checking user during Google sign in:", error);
        }
      }
      
      return true; // Allow sign in
    },
    
    // Add custom data to JWT token
    async jwt({ token, user, account }) {
      // Keep existing token data during refresh
      if (account && user) {
        // Initial sign-in: add user data to token
        return {
          ...token,
          id: user.id,
          role: user.role || "player", // Default to player role
          teamId: user.teamId,
          isNewUser: user.isNewUser,
        };
      }
      return token;
    },
    
    // Add data from token to session
    session({ session, token, user }) {
      if (session.user) {
        if (token) {
          // For JWT strategy
          session.user.id = token.sub ?? token.id ?? "";
          // Add role and teamId if they exist
          session.user.role = token.role as string || "player"; // Default to player
          if (token.teamId) session.user.teamId = token.teamId as string;
          if (token.isNewUser) session.user.isNewUser = token.isNewUser as boolean;
        } else if (user) {
          // For database strategy
          session.user.id = user.id;
          session.user.role = user.role || "player"; // Default to player
          if (user.teamId) session.user.teamId = user.teamId;
          // With database strategy, we need to check if this is a new user each time
          session.user.isNewUser = user.isNewUser || false;
        }
      }
      return session;
    },
    
    // Redirect after sign-in based on user status
    async redirect({ url, baseUrl }) {
      // Handle the case where a URL parameter indicates a new user
      if (url.startsWith(baseUrl) && url.includes("?isNewUser=true")) {
        console.log("Redirecting new user to profile completion page");
        return `${baseUrl}/auth/complete-profile`;
      }
      
      // Also handle the callback URL which might have the new user flag
      if (url.startsWith(`${baseUrl}/api/auth/callback/`) && url.includes("?isNewUser=true")) {
        console.log("Redirecting from callback with new user flag");
        return `${baseUrl}/auth/complete-profile`;
      }

      // If url is an absolute URL and starts with baseUrl, use it
      if (url.startsWith(baseUrl)) return url;
      
      // Otherwise fall back to the base URL
      return baseUrl;
    }
  },
  
  // Configure authentication providers
  providers: [
    // Google OAuth provider
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true, // Enable account linking by email
      profile(profile) {
        // Return only fields that exist in the database schema
        // Don't include id - let MongoDB generate it
        return {
          email: profile.email,
          name: profile.name,
          image: profile.picture,
          role: "player", // Default role
        };
      },
    }),
  ],
  
  // Secret used to sign cookies
  secret: process.env.NEXTAUTH_SECRET,
  
  // Configure events
  events: {
    async createUser(message) {
      // Log when a new user is created
      console.log(`New user created: ${message.user.email}`);
    },
    
    async signIn(message) {
      // Check if user exists in our database
      try {
        const { user, account } = message;
        
        // Only perform this check for OAuth providers
        if (account?.provider === "google") {
          const dbUser = await db.user.findUnique({
            where: { email: user.email ?? "" }
          });
          
          // If user doesn't exist in our database yet, mark them as new
          // by setting the isNewUser flag in the session but not in the database
          if (!dbUser) {
            // Don't try to save this to the database, it's just for the session
            user.isNewUser = true;
          }
        }
      } catch (error) {
        console.error("Error checking user on sign in:", error);
      }
    },
    
    async signOut(message) {
      // Perform any cleanup needed on sign out
      // Handle both possible message formats safely
      if ('session' in message && message.session?.user?.email) {
        console.log(`User signed out: ${message.session.user.email}`);
      } else if ('token' in message && message.token?.email) {
        console.log(`User signed out: ${message.token.email}`);
      } else {
        console.log('User signed out');
      }
    }
  }
}; 