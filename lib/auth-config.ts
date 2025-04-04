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

/**
 * Configure NextAuth with custom settings
 */
export const authConfig: NextAuthConfig = {
  // Use Prisma adapter for database session storage
  adapter: {
    ...PrismaAdapter(db),
    createUser: async (data: any) => {
      // Remove isNewUser from data before passing to Prisma
      const { isNewUser, id, ...userData } = data;
      
      // Don't pass the UUID-style id from Auth.js - let MongoDB generate an ObjectID
      // This avoids the "Malformed ObjectID" error
      return db.user.create({ 
        data: userData
      });
    },
    linkAccount: async (account: any) => {
      try {
        // First try to find a user that already has this email
        // This helps when the issue is the OAuthAccountNotLinked error
        const provider = account.provider;
        const providerAccountId = account.providerAccountId;
        
        if (provider === 'google') {
          // For google accounts, we can try to link with existing users
          const existingGoogleAccount = await db.account.findFirst({
            where: {
              provider,
              providerAccountId,
            }
          });
          
          if (existingGoogleAccount) {
            console.log("Google account already exists, no need to relink");
            return existingGoogleAccount;
          }
        }
        
        // Get all accounts to find the user this should be linked to
        const allUsers = await db.user.findMany({
          orderBy: { createdAt: 'desc' },
          take: 1 // Get the most recently created user
        });
        
        if (allUsers.length === 0) {
          throw new Error("No users found when linking account");
        }
        
        const mostRecentUser = allUsers[0];
        
        // Create the account with MongoDB compatible ID
        const { id, userId, ...accountData } = account;
        
        console.log(`Linking account ${provider} to user ${mostRecentUser.email}`);
        
        return db.account.create({
          data: {
            ...accountData,
            userId: mostRecentUser.id // Use the MongoDB ObjectId
          }
        });
      } catch (error) {
        console.error("Error linking account:", error);
        throw error;
      }
    }
  } as any, // Type cast due to compatibility issues

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
    
    // Email/Password provider
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Find user by email
          const user = await db.user.findUnique({
            where: { email: credentials.email }
          });

          // Check if user exists and has a password
          if (!user || !user.password) {
            return null;
          }

          // Verify password
          const passwordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          // Return null if password is invalid
          if (!passwordValid) {
            return null;
          }

          // Return user data with defaults for optional fields
          return {
            id: user.id,
            email: user.email,
            name: user.name ?? undefined,
            role: user.role ?? "player", // Default to player if no role
            teamId: user.teamId ?? undefined,
            isNewUser: false,
          };
        } catch (error) {
          console.error("Error during authentication:", error);
          return null;
        }
      }
    })
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