import supertest from 'supertest'
import createTestDatabase from '../../../../tests/utils/createTestDatabase'
import { createFor } from '../../../../tests/utils/records'
import cleanDatabase from '../../../../tests/utils/createTestDatabase/databaseCleaner'
import createApp from '../../../app'
import * as fixtures from '../../../../tests/utils/fixtures'
import { SprintSelect } from '../repository'
import MockDiscordService from '../../../../tests/utils/mockDiscordService'

const { db } = await createTestDatabase()
const mockDiscordBot = new MockDiscordService()
const app = createApp(db, mockDiscordBot)
const createSprints = createFor(db, 'sprints')

describe('GET /sprints happy path', () => {
  let testsprintCode: string
  let expectedSprint: SprintSelect

  beforeAll(async () => {
    await cleanDatabase(db)
    const [sprint1] = await createSprints(fixtures.sprints)
    testsprintCode = sprint1.sprintCode
    expectedSprint = sprint1
  })

  test('should respond with a 200 status code', async () => {
    const response = await supertest(app).get('/sprints')
    expect(response.statusCode).toBe(200)
  })

  test('should respond with a json', async () => {
    const response = await supertest(app).get('/sprints')
    expect(response.headers['content-type']).toEqual(
      expect.stringContaining('json')
    )
  })

  test('should get all sprints', async () => {
    const response = await supertest(app).get('/sprints')
    expect(response.body).toHaveLength(fixtures.sprints.length)
  })

  test('should get sprint by sprintCode', async () => {
    const response = await supertest(app)
      .get('/sprints')
      .query({ sprintCode: testsprintCode })
    expect(response.body).toHaveLength(1)
    expect(response.body[0]).toEqual(expectedSprint)
  })

  test('should get sprint by sprint id', async () => {
    const response = await supertest(app)
      .get('/sprints')
      .query({ id: expectedSprint.id })
    expect(response.body).toHaveLength(1)
    expect(response.body[0]).toEqual(expectedSprint)
  })

  test('should respond with an error if sprintCode does not exist', async () => {
    const response = await supertest(app)
      .get('/sprints')
      .query({ sprintCode: 'nonexistent' })
    expect(response.statusCode).toBe(404)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toHaveProperty('message')
  })

  afterAll(async () => {
    await cleanDatabase(db)
  })
})

describe('POST /sprints', () => {
  const sprints = {
    valid: { sprintCode: 'Code-1', topicName: 'Sprint topic name' },
    invalidName: { sprintCode: 'C', topicName: 'Sprint topic name' },
    invalidTopic: { sprintCode: 'Code-2', topicName: 'S' },
  }

  beforeAll(async () => {
    await cleanDatabase(db)
    await createSprints([sprints.valid])
  })

  test('should respond with a 400 status code if sprintCode already exists', async () => {
    const response = await supertest(app).post('/sprints').send(sprints.valid)
    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('error')
  })

  test('should respond with a 400 status code if topicName is invalid', async () => {
    const response = await supertest(app)
      .post('/sprints')
      .send(sprints.invalidTopic)
    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('error')
  })

  test('should respond with a 400 status code if sprintCode is invalid', async () => {
    const response = await supertest(app)
      .post('/sprints')
      .send(sprints.invalidName)
    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('error')
  })

  afterAll(async () => {
    await cleanDatabase(db)
  })
})

describe('PATCH /sprints/:id', () => {
  let sprintId: number
  const updateSprint = {
    sprintCode: 'Code-updated',
    topicName: 'Updated topic',
  }

  beforeAll(async () => {
    await cleanDatabase(db)
    const [sprint] = await createSprints([
      { sprintCode: 'Code-1', topicName: 'Sprint topic name' },
    ])
    sprintId = sprint.id
  })

  test('should update sprint successfully', async () => {
    const response = await supertest(app)
      .patch(`/sprints/${sprintId}`)
      .send(updateSprint)
    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({ id: sprintId, ...updateSprint })
  })

  test('should return 400 if sprint id is invalid', async () => {
    const response = await supertest(app)
      .patch(`/sprints/invalid-id`)
      .send(updateSprint)
    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('error')
  })

  test('should return 400 if body is invalid', async () => {
    const response = await supertest(app)
      .patch(`/sprints/${sprintId}`)
      .send({ sprintCode: '', topicName: '' })
    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('error')
  })

  afterAll(async () => {
    await cleanDatabase(db)
  })
})

describe('DELETE /sprints/:id', () => {
  let sprintId: number

  beforeAll(async () => {
    await cleanDatabase(db)
    const [sprint] = await createSprints([
      { sprintCode: 'Code-1', topicName: 'Sprint topic name' },
    ])
    sprintId = sprint.id
  })

  test('should delete sprint successfully', async () => {
    const response = await supertest(app).delete(`/sprints/${sprintId}`)
    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty(
      'message',
      'Sprint deleted successfully'
    )
  })

  afterAll(async () => {
    await cleanDatabase(db)
  })
})

describe('unsupported endpoints', () => {
  test('should respond with a 405 status code when calling wrong method on /sprints', async () => {
    const response = await supertest(app).post('/sprints/unsupported')
    expect(response.statusCode).toBe(405)
    expect(response.body).toHaveProperty('error')
  })
})
