import { Kysely, Insertable, Selectable } from 'kysely'
import { DB } from '@/database'

type Template = Selectable<DB['templates']>
type NewTemplate = Insertable<DB['templates']>

export const createTemplatesRepository = (db: Kysely<DB>) => {
  const findAll = (): Promise<Template[]> =>
    db.selectFrom('templates').selectAll().execute()

  const findById = (id: number): Promise<Template | undefined> =>
    db.selectFrom('templates')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst()

  const create = (data: NewTemplate): Promise<Template> =>
    db.insertInto('templates')
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow()

  const remove = (id: number): Promise<void> =>
    db.deleteFrom('templates')
      .where('id', '=', id)
      .execute()
      .then(() => {})

  return {
    findAll,
    findById,
    create,
    remove,
  }
}
