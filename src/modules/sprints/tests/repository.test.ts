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

  test('should return empty array if no sprints', async () => {
    const sprints = await repository.findAll()
    expect(sprints).toEqual([])
  })

  test('should get sprint by sprintCode', async () => {
    const [createdSprint] = await createSprint([fixtures.sprints[0]])
    const sprint = await repository.findByName(createdSprint.sprintCode)
    expect(sprint).toMatchObject({
      sprintCode: createdSprint.sprintCode,
      topicName: createdSprint.topicName,
    })
  })

  test('should return undefined for non-existing sprintCode', async () => {
    const sprint = await repository.findByName('non-existent-code')
    expect(sprint).toBeUndefined()
  })

  test('should get sprint by id', async () => {
    const [createdSprint] = await createSprint([fixtures.sprints[0]])
    const sprint = await repository.findById(createdSprint.id)
    expect(sprint).toBeDefined()
    expect(sprint?.id).toBe(createdSprint.id)
  })

  test('should return undefined for non-existing id', async () => {
    const sprint = await repository.findById(999999)
    expect(sprint).toBeUndefined()
  })

  test('should add new sprint', async () => {
    const newSprint = {
      sprintCode: 'Test Sprint',
      topicName: 'Test Topic',
    }
    const created = await repository.create(newSprint)
    expect(created).toMatchObject(newSprint)
    expect(created.id).toBeDefined()
  })

  test('should throw error if create returns null or undefined', async () => {
    const originalInsert = db.insertInto
    db.insertInto = () =>
      ({
        values: () => ({
          returningAll: () => ({
            executeTakeFirst: async () => null,
          }),
        }),
      }) as any

    await expect(
      repository.create({ sprintCode: 'x', topicName: 'y' })
    ).rejects.toThrow('Failed to create sprint')

    db.insertInto = originalInsert
  })

  test('should delete sprint and return DeleteResult', async () => {
    const [createdSprint] = await createSprint([fixtures.sprints[0]])
    const deleteResult = await repository.remove(createdSprint.id)
    expect(deleteResult).toHaveProperty('numDeletedRows')
    const found = await repository.findById(createdSprint.id)
    expect(found).toBeUndefined()
  })

  test('should throw error if remove returns empty result', async () => {
    const originalDelete = db.deleteFrom
    db.deleteFrom = () =>
      ({
        where: () => ({
          execute: async () => [],
        }),
      }) as any

    await expect(repository.remove(123)).rejects.toThrow(
      'Failed to delete sprint'
    )

    db.deleteFrom = originalDelete
  })

  test('should seed default sprints', async () => {
    await repository.seed()
    const all = await repository.findAll()
    expect(all.length).toBeGreaterThan(0)
  })
})
