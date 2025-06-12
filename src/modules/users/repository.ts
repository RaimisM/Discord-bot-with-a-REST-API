import type { Selectable, Insertable, Updateable, DeleteResult } from 'kysely'
import type { Users, Database } from '@/database'

export type UsersSelect = Selectable<Users>
export type UsersInsert = Insertable<Users>
export type UsersUpdate = Updateable<Users>

export interface UsersRepository {
  findAll(): Promise<UsersSelect[]>
  findById(id: string): Promise<UsersSelect | undefined>
  findByUsername(username: string): Promise<UsersSelect | undefined>
  create(user: UsersInsert): Promise<UsersSelect | undefined>
  update(id: string, updates: UsersUpdate): Promise<UsersSelect | undefined>
  delete(id: string): Promise<DeleteResult>
}

export default (db: Database): UsersRepository => ({
  findAll: async () => db.selectFrom('users').selectAll().execute(),

  findById: async (id: string) =>
    db.selectFrom('users').selectAll().where('id', '=', id).executeTakeFirst(),

  findByUsername: async (username: string) =>
    db
      .selectFrom('users')
      .selectAll()
      .where('username', '=', username)
      .executeTakeFirst(),

  create: async (user: UsersInsert) =>
    db.insertInto('users').values(user).returningAll().executeTakeFirst(),

  update: async (id: string, updates: UsersUpdate) =>
    db
      .updateTable('users')
      .set(updates)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst(),

  delete: async (id: string) =>
    db.deleteFrom('users').where('id', '=', id).executeTakeFirst(),
})
