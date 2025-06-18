import createDb from '@/database'
import createSprintsRepository from './repository'
import { sprints } from './data/sprintData'

async function seedSprints() {
  const db = createDb('data/database.db')
  const repo = createSprintsRepository(db)

  await Promise.all(sprints.map((sprint) => repo.create(sprint)))
  console.log(`Seeded ${sprints.length} sprints`) // eslint-disable-line no-console
}

seedSprints()
  .catch((err) => {
    console.error('Failed to seed sprints:', err) // eslint-disable-line no-console
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
