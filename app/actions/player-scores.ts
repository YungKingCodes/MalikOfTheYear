"use server"

import { db } from "@/lib/db";
import { auth } from "@/auth";

/**
 * Fetches existing player ratings submitted by the current user for a specific phase.
 */
export async function getExistingPlayerRatingsForPhase(phaseId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  const userId = session.user.id;

  if (!phaseId) {
    throw new Error("Phase ID is required");
  }

  try {
    const ratings = await db.playerRating.findMany({
      where: {
        raterId: userId,
        phaseId: phaseId,
      },
      select: {
        ratedId: true, // We only need to know *who* has been rated
      },
    });

    // Return a Set for efficient lookup
    return new Set(ratings.map(r => r.ratedId));
  } catch (error) {
    console.error("Error fetching existing player ratings:", error);
    throw new Error("Failed to fetch existing ratings");
  }
}

/**
 * Fetches a specific player rating given by the current user for a specific player/phase.
 */
export async function getPlayerRatingDetails(phaseId: string, ratedId: string) {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }
    const raterId = session.user.id;
  
    if (!phaseId || !ratedId) {
      throw new Error("Phase ID and Rated Player ID are required");
    }
  
    try {
      const rating = await db.playerRating.findFirst({
        where: {
          raterId: raterId,
          ratedId: ratedId,
          phaseId: phaseId,
        },
      });
      return rating;
    } catch (error) {
      console.error("Error fetching player rating details:", error);
      throw new Error("Failed to fetch rating details");
    }
  } 