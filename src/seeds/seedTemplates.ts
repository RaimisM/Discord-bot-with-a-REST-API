import { createTemplatesRepository } from '@/modules/templates/repository'
import { templates } from '@/modules/templates/data/templateData'

export async function seedTemplates(db: any) {
  const repo = createTemplatesRepository(db)
  await Promise.all(templates.map((template) => repo.create(template)))
  console.log(`Seeded ${templates.length} templates`) // eslint-disable-line no-console
}