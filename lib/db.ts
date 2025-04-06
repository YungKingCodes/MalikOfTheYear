import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Find multiple documents with query and sorting
export async function findDocuments(
  collectionName: string,
  query: Record<string, any> = {},
  options: { sort?: Record<string, number> } = {},
) {
  try {
    // Convert collectionName to proper Prisma model name by capitalizing first letter
    const modelName = collectionName.charAt(0).toUpperCase() + collectionName.slice(1, -1);
    
    // Handle special cases for queries
    if (collectionName === "games" && query.teamId) {
      // For games, check if team1Id or team2Id matches the teamId
      const teamId = query.teamId;
      delete query.teamId;
      
      return await db.game.findMany({
        where: {
          OR: [
            { team1Id: teamId },
            { team2Id: teamId }
          ],
          ...query
        },
        orderBy: options.sort ? 
          Object.entries(options.sort).map(([key, value]) => ({
            [key]: value === 1 ? 'asc' : 'desc'
          }))[0] : 
          undefined
      });
    }
    
    // Use dynamic Prisma client access for the collection
    // @ts-ignore - dynamic model access
    return await db[modelName.toLowerCase()].findMany({
      where: query,
      orderBy: options.sort ? 
        Object.entries(options.sort).map(([key, value]) => ({
          [key]: value === 1 ? 'asc' : 'desc'
        }))[0] : 
        undefined
    });
  } catch (error) {
    console.error(`Error in findDocuments for ${collectionName}:`, error);
    throw error;
  }
}

// Find a single document with the provided query
export async function findDocument(collectionName: string, query: Record<string, any>) {
  try {
    // Convert collectionName to proper Prisma model name
    const modelName = collectionName.charAt(0).toUpperCase() + collectionName.slice(1, -1);
    
    // Convert _id to id for Prisma compatibility
    if (query._id) {
      query.id = query._id;
      delete query._id;
    }
    
    // @ts-ignore - dynamic model access
    return await db[modelName.toLowerCase()].findFirst({
      where: query
    });
  } catch (error) {
    console.error(`Error in findDocument for ${collectionName}:`, error);
    throw error;
  }
}

// Update a document with the provided query and update data
export async function updateDocument(collectionName: string, query: Record<string, any>, update: Record<string, any>) {
  try {
    // Convert collectionName to proper Prisma model name
    const modelName = collectionName.charAt(0).toUpperCase() + collectionName.slice(1, -1);
    
    // Extract the ID from the query, as Prisma update requires an ID
    let id = query.id;
    if (query._id) {
      id = query._id;
    }
    
    if (!id) {
      throw new Error("ID is required for update operations");
    }
    
    // @ts-ignore - dynamic model access
    const result = await db[modelName.toLowerCase()].update({
      where: { id },
      data: update
    });
    
    return { acknowledged: true, modifiedCount: 1, id: result.id };
  } catch (error) {
    console.error(`Error in updateDocument for ${collectionName}:`, error);
    throw error;
  }
}

// Insert a new document into the collection
export async function insertDocument(collectionName: string, document: Record<string, any>) {
  try {
    // Convert collectionName to proper Prisma model name
    const modelName = collectionName.charAt(0).toUpperCase() + collectionName.slice(1, -1);
    
    // @ts-ignore - dynamic model access
    const result = await db[modelName.toLowerCase()].create({
      data: document
    });
    
    return { acknowledged: true, insertedId: result.id };
  } catch (error) {
    console.error(`Error in insertDocument for ${collectionName}:`, error);
    throw error;
  }
}

