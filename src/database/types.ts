import type { ColumnType } from 'kysely'

export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>

export interface Images {
  id: Generated<number>
  url: string
}

export interface Messages {
  createdAt: Generated<string>
  gifUrl: string
  id: Generated<number>
  originalMessage: string
  sprintCode: string
  sprintId: number
  sprintTopic: string
  templateId: number
  templateText: string
  username: string
}

export interface Sprints {
  id: Generated<number>
  sprintCode: string
  topicName: string
}

export interface Templates {
  id: Generated<number>
  text: string
}

export interface Users {
  id: string
  username: string
}

export interface DB {
  images: Images
  messages: Messages
  sprints: Sprints
  templates: Templates
  users: Users
}
