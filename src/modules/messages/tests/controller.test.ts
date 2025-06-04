import supertest from 'supertest'
import createTestDatabase from '../../../../tests/utils/createTestDatabase'
import { createFor } from '../../../../tests/utils/records'
import cleanDatabase from '../../../../tests/utils/createTestDatabase/databaseCleaner'
import createApp from '@/app'
import * as fixtures from './fixtures'

const testDb = await createTestDatabase()
const { db } = testDb

const app = createApp(db)
const createMessages = createFor(db, 'messages')
const createUsers = createFor(db, 'users')
const createTemplates = createFor(db, 'templates')
const createSprints = createFor(db, 'sprints')

beforeAll(async () => {
  await cleanDatabase(db)
  await createSprints(fixtures.sprints)
  await createTemplates(fixtures.templates)
  await createUsers(fixtures.users)
  await createMessages(fixtures.messages)
})

afterAll(async () => {
  await cleanDatabase(db)
  await db.destroy()
})

beforeEach(async () => {
  await cleanDatabase(db)
  await createSprints(fixtures.sprints)
  await createTemplates(fixtures.templates)
  await createUsers(fixtures.users)
  await createMessages(fixtures.messages)
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
  const tomMessage = {
    gifUrl: 'test',
    originalMessage: 'congrats',
    sprintName: 'WD-1.1',
    sprintId: 1,
    sprintTopic: 'First Steps Into Programming with Python', // corrected
    templateId: 1,
    templateText: 'message',
    username: 'Tom',
  }

  await createMessages([tomMessage])

  const response = await supertest(app).get('/messages?username=Tom')
  expect(response.status).toBe(200)
  expect(response.body.every((msg: any) => msg.username === 'Tom')).toBe(true)
})


  test('should filter messages by sprintName', async () => {
    const response = await supertest(app).get('/messages?sprintName=WD-1.1')
    expect(response.status).toBe(200)
    expect(response.body.every((msg: any) => msg.sprintName === 'WD-1.1')).toBe(true)
  })

  test('should respond with 400 for invalid query param', async () => {
    const response = await supertest(app).get('/messages?sprintId=not-a-number')
    expect([400, 422]).toContain(response.status)
  })
})
