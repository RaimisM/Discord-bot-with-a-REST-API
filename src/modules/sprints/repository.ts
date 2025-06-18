import type { Kysely, Selectable, Insertable, DeleteResult } from 'kysely'
import type { Sprints, DB } from '@/database'
import { sprints as defaultSprints } from '@/modules/sprints/data/sprintData'

export type SprintSelect = Selectable<Sprints>
export type SprintInsert = Insertable<Sprints>

export interface SprintsRepository {
  findAll(): Promise<SprintSelect[]>
  findByName(sprintCode: string): Promise<SprintSelect | undefined>
  findById(sprintId: number): Promise<SprintSelect | undefined>
  create(sprint: SprintInsert): Promise<SprintSelect>
  remove(sprintId: number): Promise<DeleteResult>
  seed(): Promise<void>
}

export default (db: Kysely<DB>): SprintsRepository => ({
  findAll: async () => db.selectFrom('sprints').selectAll().execute(),

  findByName: async (sprintCode) =>
    db
      .selectFrom('sprints')
      .selectAll()
      .where('sprintCode', '=', sprintCode)
      .executeTakeFirst(),

  findById: async (id) =>
    db
      .selectFrom('sprints')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst(),

  create: async (sprint) => {
    const result = await db
      .insertInto('sprints')
      .values(sprint)
      .returningAll()
      .executeTakeFirst()
    if (!result) {
      throw new Error('Failed to create sprint')
    }
    return result
  },

  remove: async (sprintId) => {
    const results = await db
      .deleteFrom('sprints')
      .where('id', '=', sprintId)
      .execute()
    if (results.length === 0) {
      throw new Error('Failed to delete sprint')
    }
    return results[0]
  },

  seed: async () => {
    await db.insertInto('sprints').values(defaultSprints).execute()
  },
})
