import { Session } from "next-auth";

/**
 * Check if the user has a specific role
 */
export function hasRole(session: Session | null, role: string): boolean {
  return session?.user?.role === role;
}

/**
 * Check if the user has any of the specified roles
 */
export function hasAnyRole(session: Session | null, roles: string[]): boolean {
  return session?.user?.role ? roles.includes(session.user.role) : false;
}

/**
 * Check if the user is part of a specific team
 */
export function isInTeam(session: Session | null, teamId: string): boolean {
  return session?.user?.teamId === teamId;
}

/**
 * Check if the user is admin
 */
export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === 'admin';
}

/**
 * Check if the user is a team captain
 */
export function isCaptain(session: Session | null): boolean {
  return session?.user?.role === 'captain';
}

/**
 * Check if the user is a regular player
 */
export function isPlayer(session: Session | null): boolean {
  return session?.user?.role === 'player';
}

/**
 * Get the current user's team ID
 */
export function getUserTeamId(session: Session | null): string | undefined {
  return session?.user?.teamId;
}

/**
 * Get the current user's role
 */
export function getUserRole(session: Session | null): string | undefined {
  return session?.user?.role;
}

/**
 * Get the current user's ID
 */
export function getUserId(session: Session | null): string | undefined {
  return session?.user?.id;
}

/**
 * Check if the resource belongs to the user's team
 */
export function canAccessTeamResource(session: Session | null, resourceTeamId: string | null): boolean {
  if (!session?.user) return false;
  if (isAdmin(session)) return true; // Admins can access all team resources
  return resourceTeamId === session.user.teamId;
}

/**
 * Check if the user owns a resource (by user ID)
 */
export function isResourceOwner(session: Session | null, resourceUserId: string): boolean {
  return session?.user?.id === resourceUserId;
}

/**
 * Check if the user can view player scores
 */
export function canViewPlayerScores(session: Session | null): boolean {
  if (!session?.user) return false;
  return ['admin', 'captain'].includes(session.user.role || '');
} 