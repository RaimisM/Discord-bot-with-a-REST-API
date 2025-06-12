import request from 'supertest'
import express from 'express'
import createTestDatabase from '../../../../tests/utils/createTestDatabase'
import cleanDatabase from '../../../../tests/utils/createTestDatabase/databaseCleaner'
import { Database } from '@/database'
import createTemplatesController from '../controller'
import jsonErrors from '@/middleware/jsonErrors'
import * as fixtures from '../../../../tests/utils/fixtures'

let db: Database
let destroy: () => Promise<void>
let app: express.Express

beforeAll(async () => {
  const testDb = await createTestDatabase()
  db = testDb.db
  destroy = testDb.destroy

  app = express()
  app.use(express.json())
  app.use('/templates', createTemplatesController(db))
  app.use(jsonErrors)
})

afterAll(async () => {
  await destroy()
})

beforeEach(async () => {
  await cleanDatabase(db)
  await db.insertInto('templates').values(fixtures.templates).execute()
})

describe('Templates Controller', () => {
  it('GET /templates should return all templates', async () => {
    const response = await request(app).get('/templates')
    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
    expect(response.body.length).toBe(fixtures.templates.length)
    expect(response.body[0]).toHaveProperty('id')
    expect(response.body[0]).toHaveProperty('text')
  })

  it('POST /templates should create a new template', async () => {
    const newTemplate = { text: 'Hello {username} for {sprint}!' }
    const response = await request(app).post('/templates').send(newTemplate)

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('id')
    expect(response.body.text).toBe(newTemplate.text)

    const dbTemplates = await db.selectFrom('templates').selectAll().execute()
    expect(dbTemplates.some((t) => t.text === newTemplate.text)).toBe(true)
  })

  it('POST /templates should return 400 for invalid template (missing placeholders)', async () => {
    const invalidTemplate = { text: 'Hello world without placeholders!' }
    const response = await request(app).post('/templates').send(invalidTemplate)

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toHaveProperty('message')
  })

  it('PATCH /templates/:id should update a template', async () => {
    const idToUpdate = fixtures.templates[0].id
    const updatedText = { text: 'Updated {username} template for {sprint}!' }

    const response = await request(app)
      .patch(`/templates/${idToUpdate}`)
      .send(updatedText)

    expect(response.status).toBe(200)
    expect(response.body.text).toBe(updatedText.text)
    expect(response.body.id).toBe(idToUpdate)

    const updated = await db
      .selectFrom('templates')
      .selectAll()
      .where('id', '=', idToUpdate)
      .executeTakeFirst()
    expect(updated?.text).toBe(updatedText.text)
  })

  it('PATCH /templates/:id should return 400 for invalid ID format', async () => {
    const invalidId = 'invalid'
    const updatedText = { text: 'Updated {username} template for {sprint}!' }

    const response = await request(app)
      .patch(`/templates/${invalidId}`)
      .send(updatedText)

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toHaveProperty('message')
  })

  it('DELETE /templates/:id should delete a template', async () => {
    const idToDelete = fixtures.templates[0].id

    const response = await request(app).delete(`/templates/${idToDelete}`)
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ success: true })

    const deleted = await db
      .selectFrom('templates')
      .selectAll()
      .where('id', '=', idToDelete)
      .executeTakeFirst()
    expect(deleted).toBeUndefined()
  })

  it('DELETE /templates/:id should return 400 for invalid ID format', async () => {
    const invalidId = 'invalid'

    const response = await request(app).delete(`/templates/${invalidId}`)
    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toHaveProperty('message')
  })

  it('Unsupported methods on /templates/:id should return 405', async () => {
    const { templates } = fixtures
    const { id } = templates[0]
    const methods = ['get', 'post'] as const

    const responses = await Promise.all(
      methods.map((method) => request(app)[method](`/templates/${id}`))
    )

    responses.forEach((res) => {
      expect(res.status).toBe(405)
    })
  })

  it('Should handle malformed JSON in request body', async () => {
    const response = await request(app)
      .post('/templates')
      .set('Content-Type', 'application/json')
      .send('{ invalid json }')

    expect(response.status).toBe(400)
  })

  it('Should return 400 for missing request body on POST', async () => {
    const response = await request(app).post('/templates').send()

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error')
  })

  it('Should return 400 for missing text field in POST', async () => {
    const response = await request(app).post('/templates').send({})

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error')
  })
})
