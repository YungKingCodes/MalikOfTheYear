import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/auth"

const DEFAULT_SETTINGS = {
  registrationOpen: true,
  allowTeamRegistration: true,
  displayScoreboard: true,
  maintenanceMode: false,
  emailNotifications: true,
  siteTitle: "Malik of the Year",
  contactEmail: "admin@malikoftheyear.com",
  maxTeamSize: 5,
  competitionPhases: ["registration", "qualification", "finals"]
}

export async function GET() {
  try {
    // Get settings from database
    let settings = await db.settings.findFirst()
    
    // If no settings exist, create default settings
    if (!settings) {
      try {
        settings = await db.settings.create({
          data: {
            data: DEFAULT_SETTINGS
          }
        })
        console.log("Created default settings")
      } catch (createError) {
        console.error("Error creating default settings:", createError)
        // If creation fails, still return default settings
        return NextResponse.json(DEFAULT_SETTINGS)
      }
    }
    
    // Parse settings from JSON if needed
    const parsedSettings = settings.data ? 
      (typeof settings.data === 'object' ? settings.data : JSON.parse(settings.data as string)) : 
      DEFAULT_SETTINGS
    
    return NextResponse.json(parsedSettings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    // Return default settings even if there's an error
    return NextResponse.json(DEFAULT_SETTINGS)
  }
}

export async function POST(request: Request) {
  try {
    // Verify that the user is an admin
    const session = await auth()
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Only admins can update settings." },
        { status: 403 }
      )
    }
    
    // Get the settings data from the request
    const body = await request.json()
    
    // Find existing settings
    const existingSettings = await db.settings.findFirst()
    
    if (existingSettings) {
      // Update existing settings
      await db.settings.update({
        where: { id: existingSettings.id },
        data: {
          data: JSON.stringify(body),
          updatedAt: new Date()
        }
      })
    } else {
      // Create new settings
      await db.settings.create({
        data: {
          data: JSON.stringify(body)
        }
      })
    }
    
    return NextResponse.json(body)
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    )
  }
} 