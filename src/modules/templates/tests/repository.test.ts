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

it('should get all templates', async () => {
  await db.insertInto('templates').values(templates).execute()
  const repo = createTemplatesRepository(db)
  const all = await repo.findAll()
  expect(all).toHaveLength(1)
})

it('should find templates by template id', async () => {
  await db.insertInto('templates').values(templates).execute()
  const repo = createTemplatesRepository(db)
  const found = await repo.findById(1)
  expect(found?.text).toEqual(templates[0].text)
})

it('should return empty if template by id is not found', async () => {
  const repo = createTemplatesRepository(db)
  const found = await repo.findById(1234)
  expect(found).toBeUndefined()
})

it('should add new template', async () => {
  const repo = createTemplatesRepository(db)
  const newTemplate = await repo.create({ text: 'hi {username}' })
  expect(newTemplate.id).toBeDefined()
  expect(newTemplate.text).toBe('hi {username}')
})

it('should delete template', async () => {
  await db.insertInto('templates').values(templates).execute()
  const repo = createTemplatesRepository(db)
  await repo.remove(1)
  const found = await repo.findById(1)
  expect(found).toBeUndefined()
})
