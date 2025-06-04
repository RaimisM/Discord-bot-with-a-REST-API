import type { Selectable, Insertable, DeleteResult } from 'kysely'
import type { Sprints, Database } from '@/database'

export interface GetSprintTopics {
    sprintName?: string
    sprintId?: number
}

export default function createSprintsRepository(db: any) {
  return {
    async getSprints(filters: any) {
      // your DB query logic here
    },
    // optionally, other methods...
  }
}
