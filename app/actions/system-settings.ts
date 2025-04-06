'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

// Define the settings interface
export interface SystemSettings {
  registrationOpen: boolean;
  allowTeamRegistration: boolean;
  displayScoreboard: boolean;
  maintenanceMode: boolean;
  emailNotifications: boolean;
  siteTitle: string;
  contactEmail: string;
  maxTeamSize: number;
  competitionPhases: string[];
}

const DEFAULT_SETTINGS: SystemSettings = {
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

/**
 * Get system settings
 */
export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    // Attempt to get settings from the database
    const settingsRecord = await db.systemSettings.findFirst()
    
    if (!settingsRecord) {
      // If no settings exist, create default settings
      const newSettings = await db.systemSettings.create({
        data: {
          settings: JSON.stringify(DEFAULT_SETTINGS)
        }
      })
      
      return DEFAULT_SETTINGS
    }
    
    // Parse settings from JSON string
    return JSON.parse(settingsRecord.settings as string) as SystemSettings
  } catch (error) {
    console.error('Failed to fetch system settings:', error)
    // Return default settings as fallback
    return DEFAULT_SETTINGS
  }
}

/**
 * Update system settings
 */
export async function updateSystemSettings(settings: SystemSettings): Promise<SystemSettings> {
  const session = await auth()
  
  // Check if the user is authenticated and is an admin
  if (!session?.user?.id || session.user.role !== 'admin') {
    throw new Error('Unauthorized: Only admins can update system settings')
  }
  
  try {
    // Check if settings record exists
    const existingSettings = await db.systemSettings.findFirst()
    
    if (existingSettings) {
      // Update existing settings
      await db.systemSettings.update({
        where: { id: existingSettings.id },
        data: {
          settings: JSON.stringify(settings),
          updatedAt: new Date()
        }
      })
    } else {
      // Create new settings record
      await db.systemSettings.create({
        data: {
          settings: JSON.stringify(settings)
        }
      })
    }
    
    // Revalidate paths that might be affected by settings changes
    revalidatePath('/admin/settings')
    revalidatePath('/dashboard')
    revalidatePath('/teams')
    
    return settings
  } catch (error) {
    console.error('Failed to update system settings:', error)
    throw new Error('Failed to update system settings')
  }
} 