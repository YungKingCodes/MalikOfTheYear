// Script to add 'type' field to all CompetitionPhase records
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

async function main() {
  // Connect to MongoDB
  const client = new MongoClient(process.env.DATABASE_URL);
  await client.connect();
  
  console.log('Connected to MongoDB successfully');
  
  const db = client.db('malik_of_the_year');
  const phasesCollection = db.collection('CompetitionPhase');
  
  // Get all phases without a type
  const phases = await phasesCollection.find({ type: { $exists: false } }).toArray();
  
  console.log(`Found ${phases.length} phases without a type field`);
  
  if (phases.length === 0) {
    console.log('No phases need to be updated');
    await client.close();
    return;
  }
  
  // Map phase names to appropriate types
  const getPhaseType = (name) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('registration')) return 'registration';
    if (nameLower.includes('team') || nameLower.includes('formation')) return 'team_formation';
    if (nameLower.includes('captain') || nameLower.includes('voting')) return 'captain_voting';
    if (nameLower.includes('competition') || nameLower.includes('game')) return 'competition';
    if (nameLower.includes('award') || nameLower.includes('ceremony')) return 'awards';
    // Default
    return 'competition';
  };
  
  // Update phases
  const updatePromises = phases.map(async (phase) => {
    const phaseType = getPhaseType(phase.name);
    return phasesCollection.updateOne(
      { _id: phase._id },
      { $set: { type: phaseType } }
    );
  });
  
  const results = await Promise.all(updatePromises);
  
  const updatedCount = results.reduce((count, result) => count + result.modifiedCount, 0);
  console.log(`Updated ${updatedCount} phases with type field`);
  
  await client.close();
  console.log('Disconnected from MongoDB');
}

main()
  .then(() => console.log('Script completed successfully'))
  .catch((error) => {
    console.error('Error running script:', error);
    process.exit(1);
  }); 