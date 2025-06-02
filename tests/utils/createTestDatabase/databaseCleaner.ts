import { sql } from 'kysely'
import { Database } from "@/database";

export default async (db: Database)=> {
    await db.deleteFrom('messages').execute();
    await db.deleteFrom('users').execute();
    await db.deleteFrom('sprints').execute();
    await db.deleteFrom('templates').execute();
    await db.deleteFrom('images').execute();

    await sql`DELETE FROM sqlite_sequence WHERE name = 'messages'`.execute(db)
    await sql`DELETE FROM sqlite_sequence WHERE name = 'users'`.execute(db)
    await sql`DELETE FROM sqlite_sequence WHERE name = 'sprints'`.execute(db)
    await sql`DELETE FROM sqlite_sequence WHERE name = 'templates'`.execute(db)
    await sql`DELETE FROM sqlite_sequence WHERE name = 'images'`.execute(db)
}