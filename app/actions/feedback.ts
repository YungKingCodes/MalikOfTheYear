"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { PrismaClient } from "@prisma/client"

// Add type casting to access Prisma models not recognized by TypeScript
type DbClient = PrismaClient & {
  feedback: any;
  feedbackVote: any;
}

// Casting db to include our models
const prisma = db as DbClient;

// Types to match Prisma schema
interface Feedback {
  id: string;
  title: string;
  description: string;
  category: "feature" | "bug" | "improvement";
  status: string;
  votes: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  userVotes: { id: string }[];
  hasVoted?: boolean;
}

interface FeedbackVote {
  id: string;
  feedbackId: string;
  userId: string;
  createdAt: Date;
}

// Validation schema for feedback submissions
const feedbackSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum(["feature", "bug", "improvement"], {
    invalid_type_error: "Category must be 'feature', 'bug', or 'improvement'",
  }),
})

export type FeedbackFormValues = z.infer<typeof feedbackSchema>

/**
 * Get all feedback items
 */
export async function getFeedback() {
  const session = await auth()

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to view feedback")
  }

  try {
    const userId = session.user.id

    // Fetch all feedback
    const feedback = await prisma.feedback.findMany({
      orderBy: [
        { votes: "desc" },
        { createdAt: "desc" },
      ],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        userVotes: {
          where: { userId },
          select: { id: true },
        },
      },
    }) as unknown as Feedback[]

    // Map to add hasVoted field for client
    return feedback.map((item) => ({
      ...item,
      hasVoted: item.userVotes.length > 0,
      userVotes: undefined, // Remove the votes data to clean up the response
    }))
  } catch (error) {
    console.error("Failed to fetch feedback:", error)
    return []
  }
}

/**
 * Create new feedback
 */
export async function createFeedback(data: FeedbackFormValues) {
  const session = await auth()

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to submit feedback")
  }

  try {
    // Validate input data
    const validatedData = feedbackSchema.parse(data)

    // Create feedback item
    const feedback = await prisma.feedback.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        userId: session.user.id,
        votes: 1, // Start with one vote (the submitter)
      },
    })

    // Add a vote from the submitter
    await prisma.feedbackVote.create({
      data: {
        feedbackId: feedback.id,
        userId: session.user.id,
      },
    })

    revalidatePath("/feedback")
    return feedback
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.errors.map(e => e.message).join(", ")}`)
    }
    console.error("Failed to create feedback:", error)
    throw new Error("Failed to submit feedback")
  }
}

/**
 * Vote for a feedback item
 */
export async function voteFeedback(feedbackId: string) {
  const session = await auth()

  if (!session?.user) {
    throw new Error("Unauthorized: You must be logged in to vote")
  }

  try {
    // Check if already voted
    const existingVote = await prisma.feedbackVote.findFirst({
      where: {
        feedbackId,
        userId: session.user.id,
      },
    })

    if (existingVote) {
      throw new Error("You have already voted for this feedback")
    }

    // Add vote
    await prisma.feedbackVote.create({
      data: {
        feedbackId,
        userId: session.user.id,
      },
    })

    // Increment vote count
    await prisma.feedback.update({
      where: { id: feedbackId },
      data: { votes: { increment: 1 } },
    })

    revalidatePath("/feedback")
    return { success: true }
  } catch (error) {
    console.error("Failed to vote for feedback:", error)
    throw new Error("Failed to vote for feedback")
  }
}

/**
 * Update feedback status (admin only)
 */
export async function updateFeedbackStatus(feedbackId: string, status: string): Promise<void> {
  const session = await auth()

  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized: Only admins can update feedback status")
  }

  try {
    // Validate status
    if (!["open", "in-progress", "completed", "rejected"].includes(status)) {
      throw new Error("Invalid status")
    }

    // Update status
    await prisma.feedback.update({
      where: { id: feedbackId },
      data: { status },
    })

    revalidatePath("/feedback")
    revalidatePath("/admin/feedback")
  } catch (error) {
    console.error("Failed to update feedback status:", error)
    throw new Error("Failed to update feedback status")
  }
} 