import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import { createMessageManager } from '../messages'
import BadRequest from '@/utils/errors/BadRequest'
import NotFound from '@/utils/errors/NotFound'
import getRandomTemplate from '../utils/getRandomTemplate'
import getRandomImage from '../utils/getRandomImage'
import generateMessage from '../generator'
import * as validators from '../validator'
import loadUsersData from '@/modules/users/loadUsersData'

const mockDb = {} as any

const mockMessagesRepository = {
  getMessages: vi.fn(),
  insertMessages: vi.fn(),
}
const mockSprintsRepository = { findByName: vi.fn() }
const mockUsersRepository = { findByUsername: vi.fn() }
const mockDiscordBot = { sendMessage: vi.fn() }

vi.mock('../repository', () => ({ default: () => mockMessagesRepository }))
vi.mock('@/modules/sprints/repository', () => ({
  default: () => mockSprintsRepository,
}))
vi.mock('@/modules/users/repository', () => ({
  default: () => mockUsersRepository,
}))
vi.mock('../validator', () => ({
  validGetRequest: vi.fn(),
  validPostRequest: vi.fn(),
}))
vi.mock('@/modules/users/loadUsersData', () => ({ default: vi.fn() }))
vi.mock('../utils/getRandomTemplate', () => ({ default: vi.fn() }))
vi.mock('../utils/getRandomImage', () => ({ default: vi.fn() }))
vi.mock('../generator', () => ({ default: vi.fn() }))

describe('createMessageManager', () => {
  let manager: ReturnType<typeof createMessageManager>

  beforeEach(() => {
    vi.clearAllMocks()
    manager = createMessageManager(mockDb, mockDiscordBot)
  })

  describe('getMessages', () => {
    const req = { query: { limit: 5 } }

    it('returns messages on valid request', async () => {
      const expected = [{ id: 1, originalMessage: 'Test', username: 'User' }]
      ;(validators.validGetRequest as Mock).mockReturnValue(req.query)
      mockMessagesRepository.getMessages.mockResolvedValue(expected)

      const result = await manager.getMessages(req as any)

      expect(result).toEqual(expected)
      expect(validators.validGetRequest).toHaveBeenCalledWith(req.query)
    })

    it('throws BadRequest for invalid input', async () => {
      await expect(manager.getMessages(null as any)).rejects.toThrow(BadRequest)
    })

    it('handles repository errors', async () => {
      const error = new Error('DB fail')
      ;(validators.validGetRequest as Mock).mockReturnValue(req.query)
      mockMessagesRepository.getMessages.mockRejectedValue(error)

      await expect(manager.getMessages(req as any)).rejects.toThrow(error)
    })
  })

  describe('createMessage', () => {
    const validBody = { username: 'User', sprintCode: 'Sprint' }
    const req = { body: validBody }

    const setupCreateMessageMocks = () => {
      const sprint = { id: 1, sprintCode: 'Sprint', topicName: 'Focus' }
      const user = { id: '123', username: 'User' }
      const template = { id: 1, text: '{username} {sprintCode}' }
      const image = 'https://image.png'
      const content = 'User Sprint'
      const discordResp = { content, createdAt: '2025-01-01' }

      ;(validators.validPostRequest as Mock).mockReturnValue(validBody)
      mockSprintsRepository.findByName.mockResolvedValue(sprint)
      mockUsersRepository.findByUsername.mockResolvedValue(user)
      ;(loadUsersData as Mock).mockResolvedValue(undefined)
      ;(getRandomTemplate as Mock).mockResolvedValue(template)
      ;(getRandomImage as Mock).mockResolvedValue(image)
      ;(generateMessage as Mock).mockResolvedValue(content)
      mockDiscordBot.sendMessage.mockResolvedValue(discordResp)
      mockMessagesRepository.insertMessages.mockResolvedValue([
        {
          id: 1,
          originalMessage: content,
          gifUrl: image,
          createdAt: discordResp.createdAt,
          sprintId: sprint.id,
          sprintCode: sprint.sprintCode,
          sprintTopic: sprint.topicName,
          templateId: template.id,
          templateText: template.text,
          username: user.username,
        },
      ])
    }

    it('creates message successfully', async () => {
      setupCreateMessageMocks()

      const result = await manager.createMessage(req as any)

      expect(result).toMatchObject({
        message: expect.stringContaining('User'),
        insertedMessages: expect.any(Array),
      })
      expect(mockDiscordBot.sendMessage).toHaveBeenCalled()
      expect(mockMessagesRepository.insertMessages).toHaveBeenCalled()
    })

    it.each([
      [null, BadRequest],
      [{}, BadRequest],
    ])('throws BadRequest for invalid body: %j', async (input, error) => {
      await expect(manager.createMessage(input as any)).rejects.toThrow(error)
    })

    it('throws on validation error', async () => {
      ;(validators.validPostRequest as Mock).mockImplementation(() => {
        throw new BadRequest('Invalid')
      })
      await expect(manager.createMessage(req as any)).rejects.toThrow(
        BadRequest
      )
    })

    it('throws NotFound if sprint missing', async () => {
      ;(validators.validPostRequest as Mock).mockReturnValue(validBody)
      mockSprintsRepository.findByName.mockResolvedValue(null)

      await expect(manager.createMessage(req as any)).rejects.toThrow(NotFound)
    })

    it('throws BadRequest if user missing', async () => {
      ;(validators.validPostRequest as Mock).mockReturnValue(validBody)
      mockSprintsRepository.findByName.mockResolvedValue({ id: 1 })
      mockUsersRepository.findByUsername.mockResolvedValue(null)

      await expect(manager.createMessage(req as any)).rejects.toThrow(
        BadRequest
      )
    })

    it('handles template service error', async () => {
      setupCreateMessageMocks()
      ;(getRandomTemplate as Mock).mockRejectedValue(new Error('fail'))

      await expect(manager.createMessage(req as any)).rejects.toThrow(
        'Template service unavailable'
      )
    })

    it('handles image service error', async () => {
      setupCreateMessageMocks()
      ;(getRandomImage as Mock).mockRejectedValue(new Error('fail'))

      await expect(manager.createMessage(req as any)).rejects.toThrow(
        'Image service unavailable'
      )
    })

    it('handles Discord failure', async () => {
      setupCreateMessageMocks()
      mockDiscordBot.sendMessage.mockResolvedValue(null)

      await expect(manager.createMessage(req as any)).rejects.toThrow(
        'Failed to send the message to Discord'
      )
    })

    it('handles DB insert error', async () => {
      setupCreateMessageMocks()
      mockMessagesRepository.insertMessages.mockRejectedValue(new Error('fail'))

      await expect(manager.createMessage(req as any)).rejects.toThrow(/fail/)
    })

    it('handles generation error', async () => {
      setupCreateMessageMocks()
      ;(generateMessage as Mock).mockRejectedValue(new Error('fail'))

      await expect(manager.createMessage(req as any)).rejects.toThrow(
        'Message generation failed'
      )
    })
  })
})
