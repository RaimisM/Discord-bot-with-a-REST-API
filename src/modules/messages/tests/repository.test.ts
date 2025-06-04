import createTestDatabase from '../../../../tests/utils/createTestDatabase'
import { createFor } from '../../../../tests/utils/records'
import cleanDatabase from '../../../../tests/utils/createTestDatabase/databaseCleaner'
import createRepository from '../repository'
import * as fixtures from './fixtures'

const testDb = await createTestDatabase()
const { db } = testDb

const repository = createRepository(db)
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

beforeEach(async () => {
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

test('should get all messages', async () => {
  const messages = await repository.getMessages()
  expect(Array.isArray(messages)).toBe(true)
  expect(messages.length).toBe(fixtures.messages.length)
  expect(messages[0]).toMatchObject({
    gifUrl: 'test url',
    originalMessage: 'congratulations!',
    sprintName: 'WD-1.1',
    sprintTopic: 'First Steps Into Programming with Python',
    username: 'Tom',
  })
})

test('should find messages by username', async () => {
  const messages = await repository.getMessages({ username: 'Tom' })
  expect(messages.length).toBeGreaterThan(0)
  expect(messages.every((msg: { username: string }) => msg.username === 'Tom')).toBe(true)
})

test('should find messages by sprint name', async () => {
  const messages = await repository.getMessages({ sprintName: 'WD-1.1' })
  expect(messages.length).toBeGreaterThan(0)
  expect(messages.every((msg: { sprintName: string }) => msg.sprintName === 'WD-1.1')).toBe(true)
})

test('should insert new message', async () => {
  const newMessage = {
    gifUrl: 'new gif url',
    originalMessage: 'new message content',
    sprintId: 1,
    sprintName: 'WD-1.1',
    sprintTopic: 'First Steps Into Programming with Python',
    templateId: 1,
    templateText: 'congratulations {username} for {sprint}!',
    username: 'John',
  }
  const inserted = await repository.insertMessages([newMessage])
  expect(inserted.length).toBe(1)
  expect(inserted[0]).toMatchObject(newMessage)

  const allMessages = await repository.getMessages()
  expect(allMessages).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        username: 'John',
        originalMessage: 'new message content',
      }),
    ])
  )
})

