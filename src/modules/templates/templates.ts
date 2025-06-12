import type { Request } from 'express'
import type { Database } from '@/database'
import { createTemplatesRepository } from './repository'
import { templatesSchema, idSchema } from './schema'

export const createTemplate = (db: Database) => {
  const repository = createTemplatesRepository(db)

  return {
    async getTemplates() {
      return repository.findAll()
    },

    async postTemplates(req: Request) {
      const { text } = templatesSchema.pick({ text: true }).parse(req.body)
      return repository.create({ text })
    },

    async patchTemplates(req: Request) {
      const id = idSchema.parse(req.params.id)
      const { text } = templatesSchema.partial().parse(req.body)

      const updated = await repository.update(id, { text })
      if (!updated) {
        throw new Error('Template not found')
      }

      return updated
    },

    async deleteTemplates(req: Request) {
      const id = idSchema.parse(req.params.id)

      const deletedCount = await repository.remove(id)
      if (deletedCount === 0) {
        throw new Error('Template not found')
      }

      return { success: true }
    },
  }
}
