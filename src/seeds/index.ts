import createDb from '@/database'
import { seedTemplates } from './seedTemplates'
import { seedSprints } from './seedSprints'

export async function runAllSeeds({ exitOnFinish = true } = {}) {
  const db = createDb('data/database.db')
  try {
    console.log('Starting database seeding...') // eslint-disable-line no-console
    await seedTemplates(db)
    await seedSprints(db)
    console.log('All seeds completed successfully!') // eslint-disable-line no-console

    if (exitOnFinish) {
      process.exit(0)
    }
  } catch (err) {
    console.error('Seeding failed:', err) // eslint-disable-line no-console
    if (exitOnFinish) {
      process.exit(1)
    }
  } finally {
    await db.destroy()
  }
}

if (require.main === module) {
  runAllSeeds()
}
