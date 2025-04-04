"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { hasAnyRole, isInTeam } from "@/lib/auth-utils";
import { useAuthLoading } from "@/app/providers";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredTeamId?: string;
  fallbackUrl?: string;
}

/**
 * A client component that protects routes based on user roles and team membership
 * 
 * Usage:
 * ```tsx
 * <ProtectedRoute allowedRoles={["admin", "captain"]}>
 *   <AdminPanel />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
  children,
  allowedRoles,
  requiredTeamId,
  fallbackUrl = "/unauthorized",
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const isAuthLoading = useAuthLoading();
  const router = useRouter();

  useEffect(() => {
    // Don't check during initial loading
    if (status === "loading" || isAuthLoading) return;
    
    // Check if user is authenticated at all
    if (status === "unauthenticated") {
      const returnTo = encodeURIComponent(window.location.pathname);
      router.push(`/auth/login?return_to=${returnTo}`);
      return;
    }
    
    // Check roles if specified
    if (allowedRoles && allowedRoles.length > 0) {
      const hasPermission = hasAnyRole(session, allowedRoles);
      if (!hasPermission) {
        router.push(fallbackUrl);
        return;
      }
    }
    
    // Check team if specified
    if (requiredTeamId) {
      const isTeamMember = isInTeam(session, requiredTeamId);
      if (!isTeamMember) {
        router.push(fallbackUrl);
        return;
      }
    }
  }, [allowedRoles, fallbackUrl, requiredTeamId, router, session, status, isAuthLoading]);

  // Show loading state while checking auth
  if (isAuthLoading || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Show content only if authorization passes
  return <>{children}</>;
} 