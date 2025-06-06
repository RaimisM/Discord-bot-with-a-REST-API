import request from 'supertest'
import express from 'express'
import createTestDatabase from '@tests/utils/createTestDatabase'
import { createFor } from '@tests/utils/records'
import cleanDatabase from '../../../../tests/utils/createTestDatabase/databaseCleaner'
import createUsersController from '../controller'

const testDb = await createTestDatabase()
const { db } = testDb
const createUsers = createFor(db, 'users')

const app = express()
app.use(express.json())
app.use('/users', createUsersController(db))

beforeAll(async () => {
  await cleanDatabase(db)
  await createUsers([
    { id: '123', username: 'TestUser1' },
    { id: '456', username: 'TestUser2' },
  ])
})

describe('Users Controller', () => {
  test('GET / should return all users', async () => {
    const response = await request(app).get('/users')
    
    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(2)
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ username: 'TestUser1' }),
        expect.objectContaining({ username: 'TestUser2' }),
      ])
    )
  })

  test('GET /:id should return user by id', async () => {
    const response = await request(app).get('/users/123')
    
    expect(response.status).toBe(200)
    expect(response.body).toEqual(
      expect.objectContaining({ id: '123', username: 'TestUser1' })
    )
  })

  test('POST / should create new user', async () => {
    const newUser = { id: '789', username: 'NewUser' }
    const response = await request(app).post('/users').send(newUser)
    
    expect(response.status).toBe(201)
    expect(response.body).toEqual(expect.objectContaining(newUser))
  })

  test('PUT /:id should update user', async () => {
    const updates = { username: 'UpdatedUser' }
    const response = await request(app).put('/users/456').send(updates)
    
    expect(response.status).toBe(200)
    expect(response.body).toEqual(
      expect.objectContaining({ id: '456', username: 'UpdatedUser' })
    )
  })

  test('DELETE /:id should delete user', async () => {
    const response = await request(app).delete('/users/789')
    
    expect(response.status).toBe(200)
  })

  test('GET /username/:username should return user by username', async () => {
    const response = await request(app).get('/users/username/TestUser1')
    
    expect(response.status).toBe(200)
    expect(response.body).toEqual(
      expect.objectContaining({ username: 'TestUser1' })
    )
  })
})

afterAll(async () => {
  await cleanDatabase(db)
  await testDb.destroy()
})