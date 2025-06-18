import express from 'express'
import supertest from 'supertest'
import {
  beforeAll,
  afterAll,
  beforeEach,
  describe,
  test,
  expect,
  vi,
} from 'vitest'
import createTestDatabase from '../../../../tests/utils/createTestDatabase'
import cleanDatabase from '../../../../tests/utils/createTestDatabase/databaseCleaner'
import { createFor } from '../../../../tests/utils/records'
import * as fixtures from '../../../../tests/utils/fixtures'
import createMessagesRouter from '@/modules/messages/controller'
import type { DiscordServiceInterface } from '@/modules/discord/discordService'

const mockDiscordBot: DiscordServiceInterface = {
  sendMessage: vi.fn().mockResolvedValue(true),
  getChannelUsers: vi.fn().mockResolvedValue([]),
  shutdown: vi.fn().mockResolvedValue(undefined),
}

let testDb: Awaited<ReturnType<typeof createTestDatabase>>
let db: any
let app: express.Express

beforeAll(async () => {
  testDb = await createTestDatabase()
  db = testDb.db

  app = express()
  app.use(express.json())
  app.use('/messages', createMessagesRouter(db, mockDiscordBot))

  await cleanDatabase(db)
  await createFor(db, 'sprints')(fixtures.sprints)
  await createFor(db, 'templates')(fixtures.templates)
  await createFor(db, 'users')(fixtures.users)
  await createFor(db, 'messages')(fixtures.messages)
})

afterAll(async () => {
  await cleanDatabase(db)
  await db.destroy()
})

beforeEach(async () => {
  await cleanDatabase(db)
  await createFor(db, 'sprints')(fixtures.sprints)
  await createFor(db, 'templates')(fixtures.templates)
  await createFor(db, 'users')(fixtures.users)
  await createFor(db, 'messages')(fixtures.messages)
})

describe('GET /messages', () => {
  test('should respond with a 200 status code', async () => {
    const response = await supertest(app).get('/messages')
    expect(response.status).toBe(200)
  })

  test('should return empty array if no messages exist', async () => {
    await cleanDatabase(db)
    const response = await supertest(app).get('/messages')
    expect(response.status).toBe(200)
    expect(response.body).toEqual([])
  })

  test('should filter messages by username', async () => {
    const createMessages = createFor(db, 'messages')
    const tomMessage = {
      gifUrl: 'test',
      originalMessage: 'congrats',
      sprintCode: 'WD-1.1',
      sprintId: 1,
      sprintTopic: 'First Steps Into Programming with Python',
      templateId: 1,
      templateText: 'message',
      username: 'Tom',
    }
    await createMessages([tomMessage])

    const response = await supertest(app).get('/messages?username=Tom')
    expect(response.status).toBe(200)
    expect(response.body.every((msg: any) => msg.username === 'Tom')).toBe(true)
  })

  test('should filter messages by sprintCode', async () => {
    const response = await supertest(app).get('/messages?sprintCode=WD-1.1')
    expect(response.status).toBe(200)
    expect(response.body.every((msg: any) => msg.sprintCode === 'WD-1.1')).toBe(
      true
    )
  })
})
