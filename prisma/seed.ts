import { PrismaClient } from '@prisma/client'
import { teams as mockTeams, users as mockUsers, competitions as mockCompetitions, games as mockGames } from '../lib/constants/mock-data'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  try {
    // First, clear any existing data, handling circular references
    // Reset relationships first to avoid constraint violations
    const users = await prisma.user.findMany();
    if (users.length > 0) {
      // Reset user teamIds
      await prisma.user.updateMany({
        data: {
          teamId: null
        }
      });
    }
    
    const teams = await prisma.team.findMany();
    if (teams.length > 0) {
      // Reset team captainId and memberId arrays
      await prisma.team.updateMany({
        data: {
          captainId: null,
          memberIds: []
        }
      });
    }
    
    // Now delete records in the correct order
    await prisma.game.deleteMany({})
    await prisma.team.deleteMany({})
    await prisma.user.deleteMany({})
    await prisma.competition.deleteMany({})

    console.log('Existing data cleared. Creating new data...')

    // Create a map to store old IDs to new IDs
    const idMap: {
      users: Record<string, string>;
      teams: Record<string, string>;
      competitions: Record<string, string>;
      games: Record<string, string>;
    } = {
      users: {},
      teams: {},
      competitions: {},
      games: {}
    };

    // Insert competitions
    for (const competition of mockCompetitions) {
      const { _id, teams: teamIds, games: gameIds, winner, goat, ...competitionData } = competition

      // Convert dates to Date objects
      const startDate = new Date(competitionData.startDate);
      const endDate = new Date(competitionData.endDate);
      const createdAt = new Date(competitionData.createdAt);

      const newCompetition = await prisma.competition.create({
        data: {
          ...competitionData,
          startDate,
          endDate,
          createdAt,
          teamIds: [],
          gameIds: []
        }
      })

      // Store mapping between old mock ID and new DB ID
      idMap.competitions[_id] = newCompetition.id;
      
      console.log(`Created competition: ${newCompetition.name} with ID: ${newCompetition.id}`)
    }
    console.log(`Created ${mockCompetitions.length} competitions`)

    // Insert users
    for (const user of mockUsers) {
      const { _id, ...userData } = user

      // Convert proficiencies to JSON format
      if (!Array.isArray(userData.proficiencies)) {
        userData.proficiencies = []
      }

      // Convert dates
      const createdAt = new Date(userData.createdAt);

      const newUser = await prisma.user.create({
        data: {
          ...userData,
          createdAt,
          teamId: null // We'll update this later after teams are created
        }
      })

      // Store mapping
      idMap.users[_id] = newUser.id;
      
      console.log(`Created user: ${newUser.name} with ID: ${newUser.id}`)
    }
    console.log(`Created ${mockUsers.length} users`)

    // Insert teams
    for (const team of mockTeams) {
      const { _id, captain, members, competitionId, ...teamData } = team

      // Convert dates
      const createdAt = new Date(teamData.createdAt);

      const newTeam = await prisma.team.create({
        data: {
          ...teamData,
          createdAt,
          captainId: captain ? idMap.users[captain] : null,
          memberIds: [],
          competitionId: idMap.competitions[competitionId]
        }
      })

      // Store mapping
      idMap.teams[_id] = newTeam.id;
      
      console.log(`Created team: ${newTeam.name} with ID: ${newTeam.id}`)
    }
    console.log(`Created ${mockTeams.length} teams`)

    // Update user teamIds after teams are created
    for (const user of mockUsers) {
      if (user.teamId) {
        await prisma.user.update({
          where: { id: idMap.users[user._id] },
          data: { teamId: idMap.teams[user.teamId] }
        })
      }
    }

    // Update team memberIds after users are created
    for (const team of mockTeams) {
      if (team.members && team.members.length) {
        const updatedMemberIds = team.members
          .map(memberId => idMap.users[memberId])
          .filter(id => id !== undefined); // Filter out any undefined IDs
        
        await prisma.team.update({
          where: { id: idMap.teams[team._id] },
          data: { memberIds: updatedMemberIds }
        })
      }
    }

    // Insert games
    for (const game of mockGames) {
      const { _id, team1, team2, competitionId, ...gameData } = game

      // Convert date
      const date = new Date(gameData.date);

      const newGame = await prisma.game.create({
        data: {
          ...gameData,
          date,
          team1Id: team1 ? idMap.teams[team1] : null,
          team2Id: team2 ? idMap.teams[team2] : null,
          competitionId: idMap.competitions[competitionId]
        }
      })

      // Store mapping
      idMap.games[_id] = newGame.id;
      
      console.log(`Created game: ${newGame.name} with ID: ${newGame.id}`)
    }
    console.log(`Created ${mockGames.length} games`)

    // Update competition teamIds and gameIds after all are created
    for (const competition of mockCompetitions) {
      const teamIds = competition.teams?.map(teamId => idMap.teams[teamId]).filter(id => id !== undefined) || [];
      const gameIds = competition.games?.map(gameId => idMap.games[gameId]).filter(id => id !== undefined) || [];
      
      await prisma.competition.update({
        where: { id: idMap.competitions[competition._id] },
        data: { 
          teamIds,
          gameIds,
          winnerId: competition.winner ? idMap.teams[competition.winner] : null,
          goatId: competition.goat ? idMap.users[competition.goat] : null
        }
      })
    }

    console.log('Seed completed successfully.')
  } catch (e) {
    console.error('Error during seeding:', e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(e => {
  console.error('Unhandled error:', e)
  process.exit(1)
}) 