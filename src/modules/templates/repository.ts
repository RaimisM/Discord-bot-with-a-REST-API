// modules/templates/repository.ts
import { Kysely, Insertable, Selectable, Updateable } from 'kysely'
import { DB } from '@/database'
import { templates as defaultTemplates } from '@/modules/templates/data/templateData'

export type Template = Selectable<DB['templates']>
export type NewTemplate = Insertable<DB['templates']>
export type TemplateUpdate = Updateable<DB['templates']>

export const createTemplatesRepository = (db: Kysely<DB>) => {
  const findAll = (): Promise<Template[]> =>
    db.selectFrom('templates').selectAll().execute()

  const findById = (id: number): Promise<Template | undefined> =>
    db
      .selectFrom('templates')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst()

  const create = (data: NewTemplate): Promise<Template> =>
    db
      .insertInto('templates')
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow()

  const update = (
    id: number,
    data: TemplateUpdate
  ): Promise<Template | undefined> =>
    db
      .updateTable('templates')
      .set(data)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()

  const remove = (id: number): Promise<number> =>
    db
      .deleteFrom('templates')
      .where('id', '=', id)
      .execute()
      .then((result) => Number(result[0]?.numDeletedRows ?? 0))

  const seed = async (): Promise<void> => {
    await db.insertInto('templates').values(defaultTemplates).execute()
  }

  return {
    findAll,
    findById,
    create,
    update,
    remove,
    seed,
  }
}
