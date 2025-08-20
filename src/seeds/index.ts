/* eslint-disable no-console */
import createDb from '@/database'
import { seedTemplates } from './seedTemplates'
import { seedSprints } from './seedSprints'

export async function runAllSeeds({ exitOnFinish = true } = {}) {
  let db: ReturnType<typeof createDb> | null = null

  try {
    console.log('Starting database seeding...')

    db = createDb('data/database.db')

    if (!db) {
      throw new Error('Failed to create database connection')
    }

    console.log('Clearing existing messages...')
    await db.deleteFrom('messages').execute()
    console.log('Clearing existing sprints...')
    await db.deleteFrom('sprints').execute()
    console.log('Clearing existing templates...')
    await db.deleteFrom('templates').execute()

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
    if (db && typeof db.destroy === 'function') {
      try {
        await db.destroy()
      } catch (destroyError) {
        console.error('Error destroying database connection:', destroyError)
      }
    }
  }
}

if (typeof require !== 'undefined' && require.main === module) {
  runAllSeeds()
} else if (
  typeof import.meta !== 'undefined' &&
  import.meta.url === `file://${process.argv[1]}`
) {
  runAllSeeds()
}
