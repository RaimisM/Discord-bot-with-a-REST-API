import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import getRandomTemplate from '../getRandomTemplate'
import { Database } from '@/database'
import { createTemplatesRepository } from '@/modules/templates/repository'

vi.mock('@/modules/templates/repository', () => ({
  createTemplatesRepository: vi.fn(),
}))

describe('getRandomTemplate', () => {
  const mockDb = {} as Database
  const mockTemplates = [
    { id: '1', template: 'Hello {username}!' },
    { id: '2', template: '{username} finished {sprint}.' },
    { id: '3', template: 'Well done, {username}!' },
  ]

  const findAllMock = vi.fn()
  const mockRepo = {
    findAll: findAllMock,
  }

  beforeEach(() => {
    findAllMock.mockReset()
    ;(createTemplatesRepository as unknown as Mock).mockReturnValue(mockRepo)
  })

  it('should return a random template from the available templates', async () => {
    findAllMock.mockResolvedValue(mockTemplates)

    const template = await getRandomTemplate(mockDb)

    expect(mockTemplates).toContainEqual(template)
    expect(createTemplatesRepository).toHaveBeenCalledWith(mockDb)
    expect(findAllMock).toHaveBeenCalledOnce()
  })

  it('should throw an error if no templates are available', async () => {
    findAllMock.mockResolvedValue([])

    await expect(() => getRandomTemplate(mockDb)).rejects.toThrow(
      'No templates available'
    )
    expect(createTemplatesRepository).toHaveBeenCalledWith(mockDb)
    expect(findAllMock).toHaveBeenCalledOnce()
  })
})
