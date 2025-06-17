import createDb from '@/database'
import { createTemplatesRepository } from './repository'
import { templates } from './data/templateData'

async function seedTemplates() {
  const db = createDb('data/database.db')
  const repo = createTemplatesRepository(db)

  await Promise.all(templates.map((template) => repo.create(template)))
  console.log(`Seeded ${templates.length} templates`) // eslint-disable-line no-console
}

seedTemplates()
  .catch((err) => {
    console.error('Failed to seed templates:', err) // eslint-disable-line no-console
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
