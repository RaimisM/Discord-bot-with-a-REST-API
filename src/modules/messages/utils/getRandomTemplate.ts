import { createTemplatesRepository } from '@/modules/templates/repository'
import { Database } from '@/database'

export default async function getRandomTemplate(db: Database) {
  const repo = createTemplatesRepository(db)
  const templates = await repo.findAll()

  if (!templates.length) {
    throw new Error('No templates available')
  }

  const index = Math.floor(Math.random() * templates.length)
  return templates[index]
}