import { PrismaClient } from '@prisma/client'
import { MongoClient, ObjectId } from 'mongodb'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const prisma = new PrismaClient()

async function main() {
  console.log('Starting proficiency data migration...')

  // Get MongoDB connection string from environment variables
  const mongoUri = process.env.DATABASE_URL
  if (!mongoUri) {
    throw new Error('DATABASE_URL is not defined in the environment variables')
  }

  const mongoClient = new MongoClient(mongoUri)

  try {
    // Connect to MongoDB
    await mongoClient.connect()
    console.log('Connected to MongoDB directly')
    
    // Get database name from connection string
    const dbName = new URL(mongoUri).pathname.substring(1)
    const db = mongoClient.db(dbName)
    
    // Get all users with proficiency data
    const usersCollection = db.collection('User')
    const users = await usersCollection.find({}).toArray()
    
    console.log(`Found ${users.length} users to process`)

    // For each user, find their competition registrations and update them
    for (const user of users) {
      // Skip users without proficiency data
      if (user.proficiencyScore === undefined && (!user.proficiencies || user.proficiencies.length === 0)) {
        console.log(`User ${user._id} has no proficiency data, skipping`)
        continue
      }

      // Find the user's competition registrations
      const registrations = await prisma.userCompetition.findMany({
        where: {
          userId: user._id.toString()
        }
      })
      
      if (registrations.length > 0) {
        // Update each competition registration with the user's proficiency data
        for (const registration of registrations) {
          await prisma.userCompetition.update({
            where: { id: registration.id },
            data: {
              proficiencyScore: user.proficiencyScore || 0,
              proficiencies: user.proficiencies || []
            }
          })
          console.log(`Updated UserCompetition record (${registration.id}) for user ${user._id}`)
        }
      } else {
        console.log(`No competition registrations found for user ${user._id}, skipping`)
      }
    }
    
    console.log('Migration completed successfully.')
  } catch (e) {
    console.error('Error during migration:', e)
    process.exit(1)
  } finally {
    await mongoClient.close()
    await prisma.$disconnect()
  }
}

main()
  .then(() => console.log('Proficiency data migration completed'))
  .catch((error) => {
    console.error('Error running migration script:', error)
    process.exit(1)
  }) 