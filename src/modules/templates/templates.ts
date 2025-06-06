import type { Request } from 'express'
import type { Database } from '@/database'

export const createTemplate = (db: Database) => ({
  async getTemplates() {
  const templates = await db.selectFrom('templates').selectAll().execute()
  return templates
  },

  async postTemplates(req: Request) {
    const { text } = req.body

    const [newTemplate] = await db
      .insertInto('templates')
      .values({ text })
      .returning(['id', 'text'])
      .execute()

    return newTemplate
  },

  async patchTemplates(req: Request) {
    const id = parseInt(req.params.id, 10)
    const { text } = req.body

    const [updatedTemplate] = await db
      .updateTable('templates')
      .set({ text })
      .where('id', '=', id)
      .returning(['id', 'text'])
      .execute()

    return updatedTemplate
  },

  async deleteTemplates(req: Request) {
    const id = parseInt(req.params.id, 10)

    await db
      .deleteFrom('templates')
      .where('id', '=', id)
      .execute()

    return { success: true }
  },
})
