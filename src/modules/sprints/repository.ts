import type { Kysely, Selectable, Insertable, DeleteResult } from 'kysely'
import type { Sprints, DB } from '@/database'
import { sprints as defaultSprints } from '@/modules/sprints/data/sprintData'

export type SprintSelect = Selectable<Sprints>
export type SprintInsert = Insertable<Sprints>
export type SprintUpdate = Partial<Omit<Sprints, 'id'>>

export interface SprintsRepository {
  findAll(): Promise<SprintSelect[]>
  findByName(sprintCode: string): Promise<SprintSelect | undefined>
  findById(sprintId: number): Promise<SprintSelect | undefined>
  create(sprint: SprintInsert): Promise<SprintSelect>
  update(id: number, sprint: SprintUpdate): Promise<SprintSelect | undefined>
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

  update: async (id, sprint) =>
    db
      .updateTable('sprints')
      .set(sprint)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst(),

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
