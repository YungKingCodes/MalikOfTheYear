import { prisma } from '@/lib/prisma'

export async function initializeDatabase() {
  console.log('Initializing database and ensuring collections exist...')
  
  try {
    // Check if the collections exist by querying each model
    // This will create the collections if they don't exist yet
    
    // Check competitions collection
    await prisma.competition.findFirst()
    
    // Check teams collection
    await prisma.team.findFirst()
    
    // Check users collection
    await prisma.user.findFirst()
    
    // Check games collection
    await prisma.game.findFirst()
    
    console.log('Database initialized successfully.')
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  }
} 