import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('sprints')
    .renameColumn('sprint_name', 'sprint_code')
    .execute()

  await db.schema
    .alterTable('messages')
    .renameColumn('sprint_name', 'sprint_code')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('sprints')
    .renameColumn('sprint_code', 'sprint_name')
    .execute()

  await db.schema
    .alterTable('messages')
    .renameColumn('sprint_code', 'sprint_name')
    .execute()
}
