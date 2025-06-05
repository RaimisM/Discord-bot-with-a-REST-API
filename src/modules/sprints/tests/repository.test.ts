import createTestDatabase from '../../../../tests/utils/createTestDatabase'
import { createFor } from '../../../../tests/utils/records'
import cleanDatabase from '../../../../tests/utils/createTestDatabase/databaseCleaner'
import createRepository from '../repository'
import * as fixtures from '../../../../tests/utils/fixtures'

let db: Awaited<ReturnType<typeof createTestDatabase>>['db']
let destroy: () => Promise<void>

beforeAll(async () => {
  const testDb = await createTestDatabase()
  db = testDb.db
  destroy = testDb.destroy
})

afterAll(async () => {
  await destroy()
})

describe('Sprints Repository', () => {
  let createSprint: ReturnType<typeof createFor>
  let repository: ReturnType<typeof createRepository>

  beforeEach(async () => {
    await cleanDatabase(db)
    createSprint = createFor(db, 'sprints')
    repository = createRepository(db)
  })

  test('should get all sprints', async () => {
    await createSprint(fixtures.sprints)
    const sprints = await repository.findAll()
    expect(sprints).toHaveLength(fixtures.sprints.length)
  })

  test('should get sprint by sprintName', async () => {
    const [createdSprint] = await createSprint([fixtures.sprints[0]])
    const sprint = await repository.findByName(createdSprint.sprintName)
    expect(sprint).toMatchObject({
      sprintName: createdSprint.sprintName,
      topicName: createdSprint.topicName,
    })
  })

  test('should get sprint by id', async () => {
    const [createdSprint] = await createSprint([fixtures.sprints[0]])
    const sprint = await repository.findById(createdSprint.id)
    expect(sprint).toBeDefined()
    expect(sprint?.id).toBe(createdSprint.id)
  })

  test('should add new sprint', async () => {
    const newSprint = {
      sprintName: 'Test Sprint',
      topicName: 'Test Topic',
    }
    const created = await repository.create(newSprint)
    expect(created).toMatchObject(newSprint)
  })

  test('should delete sprint', async () => {
    const [createdSprint] = await createSprint([fixtures.sprints[0]])
    await repository.remove(createdSprint.id)
    const found = await repository.findById(createdSprint.id)
    expect(found).toBeUndefined()
  })
})