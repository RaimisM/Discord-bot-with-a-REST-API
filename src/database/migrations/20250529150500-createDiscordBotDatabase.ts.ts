import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('templates')
    .ifNotExists()
    .addColumn('id', 'integer', (col) =>
      col.primaryKey().unique().autoIncrement().notNull()
    )
    .addColumn('text', 'varchar(255)', (col) => col.notNull())
    .execute()

  await db.schema
    .createTable('sprints')
    .ifNotExists()
    .addColumn('id', 'integer', (col) =>
      col.primaryKey().unique().autoIncrement().notNull()
    )
    .addColumn('sprint_name', 'varchar(50)', (col) => col.notNull().unique())
    .addColumn('topic_name', 'varchar(255)', (col) => col.notNull())
    .execute()

  await db.schema
    .createTable('users')
    .ifNotExists()
    .addColumn('id', 'varchar(255)', (col) => col.primaryKey().notNull().unique())
    .addColumn('username', 'varchar(100)', (col) => col.notNull().unique())
    .execute()

  await db.schema
    .createTable('images')
    .ifNotExists()
    .addColumn('id', 'integer', (col) =>
      col.primaryKey().autoIncrement().notNull().unique()
    )
    .addColumn('url', 'varchar(255)', (col) => col.notNull().unique())
    .execute()

  await db.schema
    .createTable('messages')
    .ifNotExists()
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement().notNull())
    .addColumn('username', 'varchar(100)', (col) => col.notNull())
    .addColumn('sprint_name', 'varchar(50)', (col) => col.notNull())
    .addColumn('sprint_id', 'integer', (col) =>
      col.notNull().references('sprints.id').onDelete('set null')
    )
    .addColumn('sprint_topic', 'text', (col) => col.notNull())
    .addColumn('original_message', 'text', (col) => col.notNull())
    .addColumn('template_id', 'integer', (col) =>
      col.notNull().references('templates.id').onDelete('set null')
    )
    .addColumn('template_text', 'text', (col) => col.notNull())
    .addColumn('gif_url', 'varchar(255)', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .execute()
}