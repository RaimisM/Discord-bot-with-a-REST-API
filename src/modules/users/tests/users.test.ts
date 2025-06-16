import request from 'supertest'
import express from 'express'
import usersManager from '../users'
import createTestDatabase from '../../../../tests/utils/createTestDatabase'
import cleanDatabase from '../../../../tests/utils/createTestDatabase/databaseCleaner'
import * as fixtures from '../../../../tests/utils/fixtures'

let db: Awaited<ReturnType<typeof createTestDatabase>>['db']
let destroy: () => Promise<void>
let app: express.Express

beforeAll(async () => {
  const testDb = await createTestDatabase()
  db = testDb.db
  destroy = testDb.destroy
  app = express()
  app.use(express.json())

  app.use('/users', usersManager(db))
})

afterAll(async () => {
  await destroy()
})

beforeEach(async () => {
  await cleanDatabase(db)
})

describe('/users route', () => {
  it('should add a new user', async () => {
    const res = await request(app)
      .post('/users')
      .send({ id: '10', username: 'Alice' })

    expect([200, 201]).toContain(res.status)
    expect(res.body).toEqual(
      expect.objectContaining({ id: '10', username: 'Alice' })
    )
  })

  it('should return all users', async () => {
    await db.insertInto('users').values(fixtures.users).execute()

    const res = await request(app).get('/users')

    expect(res.status).toBe(200)
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: '1', username: 'Tom' }),
        expect.objectContaining({ id: '2', username: 'John' }),
      ])
    )
  })

  it('should return 404 on unknown route', async () => {
    const res = await request(app).get('/nonexistent-path')

    expect(res.status).toBe(404)
  })
})
