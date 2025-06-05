import supertest from 'supertest'
import createTestDatabase from '../../../../tests/utils/createTestDatabase'
import { createFor } from '../../../../tests/utils/records'
import cleanDatabase from '../../../../tests/utils/createTestDatabase/databaseCleaner'
import createApp from '../../../app'
import * as fixtures from '../../../../tests/utils/fixtures'
import  { SprintSelect } from '../repository'


const { db } = await createTestDatabase()

const app = createApp(db)
const createSprints = createFor(db, 'sprints')

describe('GET /sprints happy path', () => {
  let testSprintName: string
  let expectedSprint: SprintSelect

  beforeAll(async () => {
    await cleanDatabase(db)
    const [sprint] = await createSprints(fixtures.sprints)
    testSprintName = sprint.sprintName
    expectedSprint = sprint
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
    expect(response.body).toHaveLength(3)
  })

  test('should get sprint by sprintName', async () => {
    const query = { sprintName: testSprintName }
    const response = await supertest(app).get('/sprints').query(query)
    expect(response.body).toHaveLength(1)
    expect(response.body[0]).toEqual(expectedSprint)
  })

  test('should get sprint by sprint id', async () => {
    const query = { id: expectedSprint.id }
    const response = await supertest(app).get('/sprints').query(query)
    expect(response.body).toHaveLength(1)
    expect(response.body[0]).toEqual(expectedSprint)
  })

  test('should respond with an error if sprintName does not exist', async () => {
    const query = { sprintName: 'cat' }
    const response = await supertest(app).get('/sprints').query(query)
    expect(response.statusCode).toBe(404)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toBeTruthy()
    expect(response.body.error).toHaveProperty('message', 'No sprints found')
  })

  afterAll(async () => {
    await db.deleteFrom('templates').execute()
  })
})

describe('POST /sprints', () => {
  const sprints = {
    valid: { sprintName: 'Code-1', topicName: 'Sprint topic name' },
    invalidName: { sprintName: 'C', topicName: 'Sprint topic name' },
    invalidTopic: { sprintName: 'Code-2', topicName: 'S' },
    noContext: { sprintName: '', topicName: '' },
  }

  beforeAll(async () => {
    await cleanDatabase(db)
  })

  test('should respond with a status code 201 and json message of inserted sprint data', async () => {
    const response = await supertest(app).post('/sprints').send(sprints.valid)

    expect(response.headers['content-type']).toEqual(
      expect.stringContaining('json')
    )
    expect(response.statusCode).toBe(201)

    expect(response.body).toHaveProperty('sprintName', 'Code-1')
    expect(response.body).toHaveProperty('topicName', 'Sprint topic name')
    expect(response.body).toHaveProperty('id', 1)
  })

  test('should respond with a 400 status code if sprintName is already in the database', async () => {
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

  test('should respond with a 400 status code if sprintName is invalid', async () => {
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

describe('PATCH /sprints', () => {
  let sprintId: number

  const updateSprint = {
    sprintName: 'Code-updated',
    topicName: 'Sprint topic name updated',
  }

  beforeAll(async () => {
    await cleanDatabase(db)
    const [sprint] = await createSprints([
      { sprintName: 'Code-1', topicName: 'Sprint topic name' },
    ])
    sprintId = sprint.id
  })

  test('should respond with a 200 status after updating sprint and with updated sprint json file', async () => {
    const response = await supertest(app)
      .patch(`/sprints/${sprintId}`)
      .send(updateSprint)

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({ id: sprintId, ...updateSprint })
  })

  test('should respond with a 400 status if sprint id is invalid', async () => {
    const invalidId = 'cat'
    const response = await supertest(app)
      .patch(`/sprints/${invalidId}`)
      .send(updateSprint)
    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toHaveProperty('message', 'Validation error')
  })

  test('should respond with 400 if update body is invalid', async () => {
  const response = await supertest(app)
    .patch(`/sprints/${sprintId}`)
    .send({ sprintName: '', topicName: '' })
  expect(response.statusCode).toBe(400)
  expect(response.body).toHaveProperty('error')
})

  test('should respond with a 400 status if sprint id does not exist', async () => {
    const invalidId = 100
    const response = await supertest(app)
      .patch(`/sprints/${invalidId}`)
      .send(updateSprint)
    expect(response.statusCode).toBe(400)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toHaveProperty(
      'message',
      'No sprint found with id to update'
    )
  })

  afterAll(async () => {
    await cleanDatabase(db)
  })
})

describe('DELETE /sprints', () => {
  let sprintId: number

  beforeAll(async () => {
    await cleanDatabase(db)
    const [sprint] = await createSprints([
      { sprintName: 'Code-1', topicName: 'Sprint topic name' },
    ])
    sprintId = sprint.id
  })

  test('should respond with a 200 status code and message when deleted successfully', async () => {
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
  test('should respond with a 405 status code when calling wrong endpoint method on /sprints', async () => {
    const response = await supertest(app).delete('/sprints')
    expect(response.statusCode).toBe(405)
    expect(response.body).toHaveProperty('error', {
      message: 'Method not allowed',
    })
  })
})