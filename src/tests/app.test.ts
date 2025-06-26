import request from 'supertest'
import type { Express } from 'express'
import createApp from '../app'
import { type Database } from '../database'
import MockDiscordService from '../../tests/utils/mockDiscordService'

const mockDb = {} as Database

describe('Express App', () => {
  let app: Express
  let originalToken: string | undefined
  let originalChannel: string | undefined

  beforeAll(() => {
    originalToken = process.env.DISCORD_TOKEN_ID
    originalChannel = process.env.DISCORD_CHANNEL_ID
  })

  afterAll(() => {
    process.env.DISCORD_TOKEN_ID = originalToken
    process.env.DISCORD_CHANNEL_ID = originalChannel
  })

  describe('Root Endpoint', () => {
    beforeEach(() => {
      app = createApp(mockDb, new MockDiscordService())
    })

    it('should respond with "API is running!" at the root URL', async () => {
      const response = await request(app).get('/')
      expect(response.status).toBe(200)
      expect(response.text).toBe('API is running!')
    })
  })

  describe('Discord Service Integration', () => {
    afterEach(() => {
      process.env.DISCORD_TOKEN_ID = originalToken
      process.env.DISCORD_CHANNEL_ID = originalChannel
    })

    it('should throw an error if Discord config is missing and no override provided', () => {
      delete process.env.DISCORD_TOKEN_ID
      delete process.env.DISCORD_CHANNEL_ID

      expect(() => createApp(mockDb)).toThrow('Missing Discord configuration')
    })

    it('should use the provided Discord service override', async () => {
      const mockDiscord = new MockDiscordService()

      app = createApp(mockDb, mockDiscord)
      app.post('/test-discord', async (req, res) => {
        const discordBot = req.app.get('discordBot') || mockDiscord
        await discordBot.sendMessage('Test message from override')
        res.status(200).send('Message sent')
      })

      const response = await request(app).post('/test-discord').send()
      expect(response.status).toBe(200)
      expect(mockDiscord.sendMessage).toHaveBeenCalledWith(
        'Test message from override'
      )
    })
  })

  describe('Middleware', () => {
    beforeEach(() => {
      app = createApp(mockDb, new MockDiscordService())
    })

    it('should parse JSON bodies using express.json middleware', async () => {
      app.post('/test-json', (req, res) => {
        res.status(200).json(req.body)
      })

      const testData = { key: 'value' }
      const response = await request(app).post('/test-json').send(testData)

      expect(response.status).toBe(200)
      expect(response.body).toEqual(testData)
    })
  })

  describe('Module Routers', () => {
    beforeEach(() => {
      app = createApp(mockDb, new MockDiscordService())
    })

    const routes = ['/users', '/messages', '/templates', '/sprints']
    routes.forEach((route) => {
      it(`should respond with status other than 404 from the ${route} endpoint`, async () => {
        const response = await request(app).get(route).send()
        expect(response.status).not.toBe(404)
      })
    })
  })
})
