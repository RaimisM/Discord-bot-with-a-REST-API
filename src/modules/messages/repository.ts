import type { Selectable, Insertable, Kysely } from 'kysely'
import type { DB, Messages } from '@/database'

export type MessagesSelect = Selectable<Messages>
export type MessagesInsert = Insertable<Messages>

export interface GetMessagesOptions {
  username?: string
  sprintCode?: string
}

export interface MessageRepository {
  getMessages(options?: GetMessagesOptions): Promise<MessagesSelect[]>
  insertMessages(messages: MessagesInsert[]): Promise<MessagesSelect[]>
}

export default function createRepository(db: Kysely<DB>): MessageRepository {
  return {
    async getMessages(options) {
      let query = db.selectFrom('messages').selectAll()

      if (options?.username) {
        query = query.where('username', '=', options.username)
      }

      if (options?.sprintCode) {
        query = query.where('sprintCode', '=', options.sprintCode)
      }

      return query.execute()
    },

    async insertMessages(messages) {
      const inserted = await db
        .insertInto('messages')
        .values(messages)
        .returningAll()
        .execute()

      return inserted
    },
  }
}
