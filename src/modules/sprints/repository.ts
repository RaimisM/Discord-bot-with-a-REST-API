import type { Selectable, Insertable, DeleteResult } from 'kysely'
import type { Sprints, Database } from '@/database'

export interface GetSprintTopics {
    sprintName?: string
    sprintId?: number
}