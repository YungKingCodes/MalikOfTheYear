const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    // Find active competition
    const activeCompetition = await prisma.competition.findFirst({
      where: { status: 'active' }
    })

    if (!activeCompetition) {
      console.log('❌ No active competition found')
      return
    }

    console.log(`📊 Found active competition: ${activeCompetition.name}`)

    // Check if phases already exist
    const existingPhases = await prisma.competitionPhase.count({
      where: { competitionId: activeCompetition.id }
    })

    if (existingPhases > 0) {
      console.log(`⚠️ Competition already has ${existingPhases} phases. Skipping...`)
      return
    }

    // Create sample phases for the competition
    const now = new Date()
    const oneWeekAgo = new Date(now)
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const oneWeekFromNow = new Date(now)
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7)

    const twoWeeksFromNow = new Date(now)
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14)

    const threeWeeksFromNow = new Date(now)
    threeWeeksFromNow.setDate(threeWeeksFromNow.getDate() + 21)

    const fourWeeksFromNow = new Date(now)
    fourWeeksFromNow.setDate(fourWeeksFromNow.getDate() + 28)

    const phases = [
      {
        name: 'Registration',
        description: 'Teams and participants register for the competition',
        startDate: new Date(oneWeekAgo),
        endDate: new Date(now),
        status: 'completed',
        order: 1,
        competitionId: activeCompetition.id
      },
      {
        name: 'Team Formation',
        description: 'Players join teams and prepare for the games',
        startDate: new Date(now),
        endDate: new Date(oneWeekFromNow),
        status: 'in-progress',
        order: 2,
        competitionId: activeCompetition.id
      },
      {
        name: 'Group Stage',
        description: 'Initial round of games to determine rankings',
        startDate: new Date(oneWeekFromNow),
        endDate: new Date(twoWeeksFromNow),
        status: 'pending',
        order: 3,
        competitionId: activeCompetition.id
      },
      {
        name: 'Playoffs',
        description: 'Elimination rounds to determine finalists',
        startDate: new Date(twoWeeksFromNow),
        endDate: new Date(threeWeeksFromNow),
        status: 'pending',
        order: 4,
        competitionId: activeCompetition.id
      },
      {
        name: 'Finals',
        description: 'Championship games to determine winners',
        startDate: new Date(threeWeeksFromNow),
        endDate: new Date(fourWeeksFromNow),
        status: 'pending',
        order: 5,
        competitionId: activeCompetition.id
      }
    ]

    // Create all phases
    const createdPhases = await prisma.competitionPhase.createMany({
      data: phases
    })

    console.log(`✅ Created ${createdPhases.count} competition phases`)
  } catch (error) {
    console.error('❌ Error creating competition phases:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
