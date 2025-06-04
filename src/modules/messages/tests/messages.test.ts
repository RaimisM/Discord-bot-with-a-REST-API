import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import { createMessageManager } from '../messages'
import BadRequest from '@/utils/errors/BadRequest'
import NotFound from '@/utils/errors/NotFound'
import getRandomTemplate from '../utils/getRandomTemplate'
import getRandomImage from '../utils/getRandomImage'
import generateMessage from '../generator'
import * as validators from '../validator'
import reloadUsersData from '@/modules/users/reloadUsersData'

const mockDb = {} as any

const mockMessagesRepository = {
  getMessages: vi.fn(),
  insertMessages: vi.fn(),
}
const mockSprintsRepository = {
  getSprints: vi.fn(),
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

vi.mock('@/modules/users/reloadUsersData', () => ({
  default: vi.fn(),
}))

vi.mock('@/modules/users/usersManager', () => ({
  default: vi.fn(() => mockUsersManager),
}))

vi.mock('../utils/getRandomTemplate', () => ({
  default: vi.fn(),
}))

vi.mock('../generator', () => ({
  default: vi.fn(),
}))

vi.mock('../utils/getRandomImage', () => ({
  default: vi.fn(),
}))

vi.mock('@/modules/sprints/repository', () => ({
  default: vi.fn(() => mockSprintsRepository),
}))

describe('messageManager', () => {
  // Pass discordBot mock as second param now
  const manager = createMessageManager(mockDb, mockDiscordBot)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should validate and return messages', async () => {
    const req = { query: { limit: 5 } }
    const expectedMessages = [{
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
    }]

    ;(validators.validGetRequest as Mock).mockReturnValue(req.query)
    mockMessagesRepository.getMessages.mockResolvedValue(expectedMessages)

    const result = await manager.getMessages(req as any)

    expect(validators.validGetRequest).toHaveBeenCalledWith(req.query)
    expect(mockMessagesRepository.getMessages).toHaveBeenCalledWith(req.query)
    expect(result).toEqual(expectedMessages)
  })

  it('should create and return a message successfully', async () => {
    const body = { username: 'Alice', sprintName: 'Sprint 1' }
    const req = { body }

    const sprint = { id: 1, sprintName: 'Sprint 1', topic: 'Focus' }
    const user = { id: '123', username: 'Alice' }
    const template = { id: 1, text: '{username} completed {sprint}' }
    const image = 'https://example.com/img.png'
    const messageContent = 'Alice completed Sprint 1'

    ;(validators.validPostRequest as Mock).mockReturnValue(body)
    mockSprintsRepository.getSprints.mockResolvedValue([sprint])
    mockUsersManager.getUser.mockReturnValue(user)
    ;(getRandomTemplate as Mock).mockResolvedValue(template)
    ;(generateMessage as Mock).mockResolvedValue(messageContent)
    ;(getRandomImage as Mock).mockResolvedValue(image)
    mockDiscordBot.sendMessage.mockResolvedValue({
      content: messageContent,
      createdAt: '2024-01-01T00:00:00Z',
    })
    mockMessagesRepository.insertMessages.mockResolvedValue([{
      id: 1,
      originalMessage: messageContent,
      gifUrl: image,
      createdAt: '2024-01-01T00:00:00Z',
      sprintId: sprint.id,
      sprintName: sprint.sprintName,
      sprintTopic: sprint.topic,
      templateId: template.id,
      templateText: template.text,
      username: user.username,
    }])
    ;(reloadUsersData as Mock).mockResolvedValue(undefined)

    const result = await manager.createMessage(req as any)

    expect(validators.validPostRequest).toHaveBeenCalledWith(req.body)
    expect(mockSprintsRepository.getSprints).toHaveBeenCalledWith({ sprintName: body.sprintName })
    expect(mockUsersManager.getUser).toHaveBeenCalledWith(body.username)
    expect(getRandomTemplate).toHaveBeenCalled()
    expect(generateMessage).toHaveBeenCalledWith({
      template: template.text,
      user,
      sprintName: sprint.sprintName,
    })
    expect(getRandomImage).toHaveBeenCalled()
    expect(mockDiscordBot.sendMessage).toHaveBeenCalledWith({
      content: messageContent,
      files: [image],
    })
    expect(mockMessagesRepository.insertMessages).toHaveBeenCalledWith([{
      gifUrl: image,
      originalMessage: messageContent,
      sprintId: sprint.id,
      sprintName: sprint.sprintName,
      sprintTopic: sprint.topic,
      templateId: template.id,
      templateText: template.text,
      username: user.username,
    }])
    expect(reloadUsersData).toHaveBeenCalledWith(mockDb, mockDiscordBot)
    expect(result).toEqual({
      message: `Message to the Discord user: ${user.username} was sent at: 2024-01-01T00:00:00Z`,
      insertedMessages: [{
        id: 1,
        originalMessage: messageContent,
        gifUrl: image,
        createdAt: '2024-01-01T00:00:00Z',
        sprintId: sprint.id,
        sprintName: sprint.sprintName,
        sprintTopic: sprint.topic,
        templateId: template.id,
        templateText: template.text,
        username: user.username,
      }],
    })
  })

  it('should throw NotFound when sprint does not exist', async () => {
    const req = { body: { username: 'Alice', sprintName: 'nonexistent' } }

    ;(validators.validPostRequest as Mock).mockReturnValue(req.body)
    mockSprintsRepository.getSprints.mockResolvedValue([])

    await expect(manager.createMessage(req as any)).rejects.toThrow(NotFound)
    expect(mockUsersManager.getUser).not.toHaveBeenCalled()
  })

  it('should throw BadRequest when user does not exist', async () => {
    const req = { body: { username: 'nonexistent', sprintName: 'Sprint 1' } }
    const sprint = { id: 1, sprintName: 'Sprint 1', topic: 'Focus' }

    ;(validators.validPostRequest as Mock).mockReturnValue(req.body)
    mockSprintsRepository.getSprints.mockResolvedValue([sprint])
    mockUsersManager.getUser.mockReturnValue(null)

    await expect(manager.createMessage(req as any)).rejects.toThrow(BadRequest)
    expect(getRandomTemplate).not.toHaveBeenCalled()
  })

  it('should throw BadRequest when validation fails', async () => {
    const req = { body: { username: 'Alice' } }

    ;(validators.validPostRequest as Mock).mockImplementation(() => {
      throw new BadRequest('Missing sprintName')
    })

    await expect(manager.createMessage(req as any)).rejects.toThrow(BadRequest)
    expect(mockSprintsRepository.getSprints).not.toHaveBeenCalled()
  })

  it('should handle repository errors in getMessages', async () => {
    const req = { query: { limit: 5 } }

    ;(validators.validGetRequest as Mock).mockReturnValue(req.query)
    mockMessagesRepository.getMessages.mockRejectedValue(new Error('Database error'))

    await expect(manager.getMessages(req as any)).rejects.toThrow('Database error')
  })

  it('should handle errors when getting random template fails', async () => {
    const req = { body: { username: 'Alice', sprintName: 'Sprint 1' } }
    const sprint = { id: 1, sprintName: 'Sprint 1', topic: 'Focus' }
    const user = { id: '123', username: 'Alice' }

    ;(validators.validPostRequest as Mock).mockReturnValue(req.body)
    mockSprintsRepository.getSprints.mockResolvedValue([sprint])
    mockUsersManager.getUser.mockReturnValue(user)
    ;(getRandomTemplate as Mock).mockRejectedValue(new Error('Template service unavailable'))

    await expect(manager.createMessage(req as any)).rejects.toThrow('Template service unavailable')
    expect(generateMessage).not.toHaveBeenCalled()
  })

  it('should handle database insertion errors', async () => {
    const req = { body: { username: 'Alice', sprintName: 'Sprint 1' } }
    const sprint = { id: 1, sprintName: 'Sprint 1', topic: 'Focus' }
    const user = { id: '123', username: 'Alice' }
    const template = { id: 1, text: '{username} completed {sprint}' }
    const image = 'https://example.com/img.png'
    const messageContent = 'Alice completed Sprint 1'

    ;(validators.validPostRequest as Mock).mockReturnValue(req.body)
    mockSprintsRepository.getSprints.mockResolvedValue([sprint])
    mockUsersManager.getUser.mockReturnValue(user)
    ;(getRandomTemplate as Mock).mockResolvedValue(template)
    ;(generateMessage as Mock).mockResolvedValue(messageContent)
    ;(getRandomImage as Mock).mockResolvedValue(image)
    mockDiscordBot.sendMessage.mockResolvedValue({
      content: messageContent,
      createdAt: '2024-01-01T00:00:00Z',
    })
    mockMessagesRepository.insertMessages.mockRejectedValue(new Error('Database insertion failed'))

    await expect(manager.createMessage(req as any)).rejects.toThrow('Database insertion failed')
  })
})
