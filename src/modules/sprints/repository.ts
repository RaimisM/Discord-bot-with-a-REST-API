import type { Kysely, Selectable, Insertable, DeleteResult } from 'kysely'
import type { Sprints, DB } from '@/database/types'

export type SprintSelect = Selectable<Sprints>
export type SprintInsert = Insertable<Sprints>

export interface SprintsRepository {
  findAll(): Promise<SprintSelect[]>
  findByName(sprintName: string): Promise<SprintSelect | undefined>
  findById(sprintId: number): Promise<SprintSelect | undefined>
  create(sprint: SprintInsert): Promise<SprintSelect>
  remove(sprintId: number): Promise<DeleteResult>
}

export default (db: Kysely<DB>): SprintsRepository => ({
  findAll: async () =>
    db.selectFrom('sprints').selectAll().execute(),
  
  findByName: async (sprintName) =>
    db
      .selectFrom('sprints')
      .selectAll()
      .where('sprintName', '=', sprintName)
      .executeTakeFirst(),
  
  findById: async (id) =>
    db
      .selectFrom('sprints')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst(),
  
  create: async (sprint) => {
    const result = await db.insertInto('sprints').values(sprint).returningAll().executeTakeFirst()
    if (!result) {
      throw new Error('Failed to create sprint')
    }
    return result
  },
  
  remove: async (sprintId) =>
    db.deleteFrom('sprints').where('id', '=', sprintId).executeTakeFirst(),
})