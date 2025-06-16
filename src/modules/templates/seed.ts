import createDb from '@/database'
import { createTemplatesRepository } from './repository'
import { templates } from './data/templateData'

async function seedTemplates() {
  const db = createDb('data/database.db')
  const repo = createTemplatesRepository(db)

  await Promise.all(
    templates.map(template => repo.create(template))
  )

  // eslint-disable-next-line no-console
  console.log(`✅ Seeded ${templates.length} templates`)
}

seedTemplates()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('❌ Failed to seed templates:', err)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
