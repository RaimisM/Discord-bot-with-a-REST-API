import createDb from '@/database'
import { seedTemplates } from './seedTemplates'
import { seedSprints } from './seedSprints'

async function runAllSeeds() {
  const db = createDb('data/database.db')
  
  try {
    console.log('Starting database seeding...') // eslint-disable-line no-console
    await seedTemplates(db)
    await seedSprints(db)
    console.log('All seeds completed successfully!') // eslint-disable-line no-console
    process.exit(0)
  } catch (err) {
    console.error('Seeding failed:', err) // eslint-disable-line no-console
    process.exit(1)
  }
}

runAllSeeds()