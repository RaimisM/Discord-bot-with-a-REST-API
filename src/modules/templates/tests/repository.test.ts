import createTestDatabase from '../../../../tests/utils/createTestDatabase'
import { createTemplatesRepository } from '../repository'
import { templates } from '../../../../tests/utils/fixtures'
import cleanDatabase from '../../../../tests/utils/createTestDatabase/databaseCleaner'

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

beforeEach(async () => {
  await cleanDatabase(db)
})

describe('Templates Repository', () => {
  it('should return empty array if no templates', async () => {
    const repo = createTemplatesRepository(db)
    const all = await repo.findAll()
    expect(all).toEqual([])
  })

  it('should get all templates', async () => {
    await db.insertInto('templates').values(templates).execute()
    const repo = createTemplatesRepository(db)
    const all = await repo.findAll()
    expect(all).toHaveLength(templates.length)
    expect(all[0]).toHaveProperty('id')
    expect(all[0]).toHaveProperty('text')
  })

  it('should find templates by template id', async () => {
    await db.insertInto('templates').values(templates).execute()
    const repo = createTemplatesRepository(db)
    const found = await repo.findById(templates[0].id)
    expect(found).toBeDefined()
    expect(found?.text).toEqual(templates[0].text)
  })

  it('should return undefined if template by id is not found', async () => {
    const repo = createTemplatesRepository(db)
    const found = await repo.findById(999999)
    expect(found).toBeUndefined()
  })

  it('should add new template', async () => {
    const repo = createTemplatesRepository(db)
    const newTemplate = await repo.create({ text: 'hi {username}' })
    expect(newTemplate.id).toBeDefined()
    expect(newTemplate.text).toBe('hi {username}')
  })

  it('should update existing template', async () => {
    await db.insertInto('templates').values(templates).execute()
    const repo = createTemplatesRepository(db)
    const updatedText = 'Updated text {username}'
    const updated = await repo.update(templates[0].id, { text: updatedText })
    expect(updated).toBeDefined()
    expect(updated?.text).toBe(updatedText)

    const found = await repo.findById(templates[0].id)
    expect(found?.text).toBe(updatedText)
  })

  it('should return undefined when updating non-existing template', async () => {
    const repo = createTemplatesRepository(db)
    const result = await repo.update(999999, { text: 'does not exist' })
    expect(result).toBeUndefined()
  })

  it('should delete template and return number of deleted rows', async () => {
    await db.insertInto('templates').values(templates).execute()
    const repo = createTemplatesRepository(db)
    const deletedCount = await repo.remove(templates[0].id)
    expect(deletedCount).toBe(1)
    const found = await repo.findById(templates[0].id)
    expect(found).toBeUndefined()
  })

  it('should return 0 when deleting non-existing template', async () => {
    const repo = createTemplatesRepository(db)
    const deletedCount = await repo.remove(999999)
    expect(deletedCount).toBe(0)
  })

  it('should seed default templates', async () => {
    const repo = createTemplatesRepository(db)
    await repo.seed()
    const all = await repo.findAll()
    expect(all.length).toBeGreaterThan(0)
  })
})
