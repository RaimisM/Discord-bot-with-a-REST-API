/* eslint-disable no-console */
import createDb from '@/database'
import { seedTemplates } from './seedTemplates'
import { seedSprints } from './seedSprints'

export async function runAllSeeds({ exitOnFinish = true } = {}) {
  const db = createDb('data/database.db')
  try {
    console.log('Starting database seeding...')
    await seedTemplates(db)
    await seedSprints(db)
    console.log('All seeds completed successfully!')

    if (exitOnFinish) {
      process.exit(0)
    }
  } catch (err) {
    console.error('Seeding failed:', err)
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
