import createSprintsRepository from '@/modules/sprints/repository'
import { sprints } from '@/modules/sprints/data/sprintData'

export async function seedSprints(db: any) {
  const repo = createSprintsRepository(db)
  await Promise.all(sprints.map((sprint) => repo.create(sprint)))
  console.log(`Seeded ${sprints.length} sprints`) // eslint-disable-line no-console
}
