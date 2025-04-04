import { NextResponse } from "next/server"
import { findDocument } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = params.id

    // Get user details
    const user = await findDocument("users", { _id: userId })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // In a real implementation, we would check the authenticated user's role
    // to determine what data to return
    // For now, we'll return all data

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

