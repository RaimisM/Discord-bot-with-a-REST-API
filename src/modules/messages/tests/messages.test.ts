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
const mockSprintsRepository = {
  findByName: vi.fn(),
}
const mockUsersManager = {
  getUser: vi.fn(),
}
const mockDiscordBot = {
  sendMessage: vi.fn(),
}
vi.mock('../validator', () => ({
  validGetRequest: vi.fn(),
  validPostRequest: vi.fn(),
}))
vi.mock('../repository', () => ({
  default: vi.fn(() => mockMessagesRepository),
}))
vi.mock('@/modules/users/loadUsersData', () => ({
  default: vi.fn(),
}))
vi.mock('@/modules/users/users', () => ({
  default: vi.fn(() => mockUsersManager),
}))
vi.mock('@/modules/sprints/repository', () => ({
  default: vi.fn(() => mockSprintsRepository),
}))
vi.mock('../utils/getRandomTemplate', () => ({
  default: vi.fn(),
}))
vi.mock('../utils/getRandomImage', () => ({
  default: vi.fn(),
}))
vi.mock('../generator', () => ({
  default: vi.fn(),
}))

describe('messageManager', () => {
  const manager = createMessageManager(mockDb, mockDiscordBot)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getMessages', () => {
    it('should validate and return messages successfully', async () => {
      const req = { query: { limit: 5 } }
      const expectedMessages = [
        {
          id: 1,
          originalMessage: 'Test message',
          gifUrl: 'https://example.com/image.gif',
          createdAt: '2024-01-01T00:00:00Z',
          sprintId: 1,
          sprintName: 'Sprint 1',
          sprintTopic: 'Productivity',
          templateId: 1,
          templateText: 'Template {username}',
          username: 'Alice',
        },
      ]

      ;(validators.validGetRequest as Mock).mockReturnValue(req.query)
      mockMessagesRepository.getMessages.mockResolvedValue(expectedMessages)

      const result = await manager.getMessages(req as any)

      expect(validators.validGetRequest).toHaveBeenCalledWith(req.query)
      expect(mockMessagesRepository.getMessages).toHaveBeenCalledWith(req.query)
      expect(result).toEqual(expectedMessages)
    })

    it('should throw BadRequest for invalid request object', async () => {
      await expect(manager.getMessages(null as any)).rejects.toThrow(BadRequest)
      await expect(manager.getMessages({} as any)).rejects.toThrow(BadRequest)
    })

    it('should handle repository errors', async () => {
      const req = { query: { limit: 5 } }
      const dbError = new Error('Database connection failed')

      ;(validators.validGetRequest as Mock).mockReturnValue(req.query)
      mockMessagesRepository.getMessages.mockRejectedValue(dbError)

      await expect(manager.getMessages(req as any)).rejects.toThrow(dbError)
    })
  })

  describe('createMessage', () => {
    const validRequestBody = { username: 'Alice', sprintName: 'Sprint 1' }
    const mockSprint = {
      id: 1,
      sprintName: 'Sprint 1',
      topicName: 'Focus'
    }
    const mockUser = {
      id: '123',
      username: 'Alice'
    }
    const mockTemplate = {
      id: 1,
      text: '{username} completed {sprintName}'
    }
    const mockImage = 'https://example.com/img.png'
    const mockGeneratedContent = 'Alice completed Sprint 1'
    const mockDiscordResponse = {
      content: mockGeneratedContent,
      createdAt: '2024-01-01T00:00:00Z',
    }

    beforeEach(() => {
      ;(validators.validPostRequest as Mock).mockReturnValue(validRequestBody)
      mockSprintsRepository.findByName.mockResolvedValue(mockSprint)
      mockUsersManager.getUser.mockResolvedValue(mockUser)
      ;(getRandomTemplate as Mock).mockResolvedValue(mockTemplate)
      ;(getRandomImage as Mock).mockResolvedValue(mockImage)
      ;(generateMessage as Mock).mockResolvedValue(mockGeneratedContent)
      mockDiscordBot.sendMessage.mockResolvedValue(mockDiscordResponse)
      mockMessagesRepository.insertMessages.mockResolvedValue([{
        id: 1,
        originalMessage: mockGeneratedContent,
        gifUrl: mockImage,
        createdAt: '2024-01-01T00:00:00Z',
        sprintId: mockSprint.id,
        sprintName: mockSprint.sprintName,
        sprintTopic: mockSprint.topicName,
        templateId: mockTemplate.id,
        templateText: mockTemplate.text,
        username: mockUser.username,
      }])
      ;(loadUsersData as Mock).mockResolvedValue(undefined)
    })

    it('should create and return a message successfully', async () => {
      const req = { body: validRequestBody }

      const result = await manager.createMessage(req as any)

      expect(validators.validPostRequest).toHaveBeenCalledWith(req.body)
      expect(mockSprintsRepository.findByName).toHaveBeenCalledWith(validRequestBody.sprintName)
      expect(mockUsersManager.getUser).toHaveBeenCalledWith(validRequestBody.username)
      expect(getRandomTemplate).toHaveBeenCalledWith(mockDb)
      expect(getRandomImage).toHaveBeenCalledWith(mockDb)
      expect(generateMessage).toHaveBeenCalledWith({
        template: mockTemplate.text,
        user: mockUser,
        sprintName: mockSprint.sprintName,
      })
      expect(mockDiscordBot.sendMessage).toHaveBeenCalledWith({
        content: mockGeneratedContent,
        files: [mockImage],
      })
      expect(mockMessagesRepository.insertMessages).toHaveBeenCalledWith([{
        gifUrl: mockImage,
        originalMessage: mockGeneratedContent,
        sprintId: mockSprint.id,
        sprintName: mockSprint.sprintName,
        sprintTopic: mockSprint.topicName || '',
        templateId: mockTemplate.id,
        templateText: mockTemplate.text,
        username: mockUser.username,
      }])
      expect(loadUsersData).toHaveBeenCalledWith(mockDb, mockDiscordBot)

      expect(result).toEqual({
        message: `Message to the Discord user: ${mockUser.username} was sent at: ${mockDiscordResponse.createdAt}`,
        insertedMessages: expect.any(Array),
      })
    })

    it('should throw BadRequest for invalid request object', async () => {
      await expect(manager.createMessage(null as any)).rejects.toThrow(BadRequest)
      await expect(manager.createMessage({} as any)).rejects.toThrow(BadRequest)
    })

    it('should throw BadRequest when validation fails', async () => {
      const req = { body: { username: 'Alice' } }
      const validationError = new BadRequest('Missing sprintName')

      ;(validators.validPostRequest as Mock).mockImplementation(() => {
        throw validationError
      })

      await expect(manager.createMessage(req as any)).rejects.toThrow(validationError)
      expect(mockSprintsRepository.findByName).not.toHaveBeenCalled()
    })

    it('should throw NotFound when sprint does not exist', async () => {
      const req = { body: validRequestBody }

      mockSprintsRepository.findByName.mockResolvedValue(null)

      await expect(manager.createMessage(req as any)).rejects.toThrow(NotFound)
      expect(mockUsersManager.getUser).not.toHaveBeenCalled()
    })

    it('should throw BadRequest when user does not exist', async () => {
      const req = { body: validRequestBody }

      mockUsersManager.getUser.mockResolvedValue(null)

      await expect(manager.createMessage(req as any)).rejects.toThrow(BadRequest)
      expect(getRandomTemplate).not.toHaveBeenCalled()
    })

    it('should handle template service errors', async () => {
      const req = { body: validRequestBody }
      const templateError = new Error('Template service unavailable')

      ;(getRandomTemplate as Mock).mockRejectedValue(templateError)

      await expect(manager.createMessage(req as any)).rejects.toThrow('Template service unavailable')
      expect(generateMessage).not.toHaveBeenCalled()
    })

    it('should handle image service errors', async () => {
      const req = { body: validRequestBody }
      const imageError = new Error('Image service unavailable')

      ;(getRandomImage as Mock).mockRejectedValue(imageError)

      await expect(manager.createMessage(req as any)).rejects.toThrow('Image service unavailable')
      expect(generateMessage).not.toHaveBeenCalled()
    })

    it('should handle Discord bot failures', async () => {
      const req = { body: validRequestBody }

      mockDiscordBot.sendMessage.mockResolvedValue(null)

      await expect(manager.createMessage(req as any)).rejects.toThrow('Failed to send the message to Discord')
      expect(mockMessagesRepository.insertMessages).not.toHaveBeenCalled()
    })

    it('should handle database insertion errors', async () => {
      const req = { body: validRequestBody }
      const dbError = new Error('Database insertion failed')

      mockMessagesRepository.insertMessages.mockRejectedValue(dbError)

      await expect(manager.createMessage(req as any)).rejects.toThrow('Database insertion failed')
      expect(loadUsersData).not.toHaveBeenCalled()
    })

    it('should handle message generation errors', async () => {
      const req = { body: validRequestBody }
      const generationError = new Error('Message generation failed')

      ;(generateMessage as Mock).mockRejectedValue(generationError)

      await expect(manager.createMessage(req as any)).rejects.toThrow(generationError)
      expect(mockDiscordBot.sendMessage).not.toHaveBeenCalled()
    })
  })
})