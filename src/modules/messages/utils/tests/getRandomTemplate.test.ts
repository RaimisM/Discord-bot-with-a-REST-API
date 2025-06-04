import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import getRandomTemplate from '../getRandomTemplate'
import { Database } from '@/database'
import createTemplatesRepository from '@/modules/templates/repository'

vi.mock('@/modules/templates/repository', () => ({
  default: vi.fn(),
}))

describe('getRandomTemplate', () => {
  const mockDb = {} as Database

  const mockTemplates = [
    { id: '1', template: 'Hello {username}!' },
    { id: '2', template: '{username} finished {sprint}.' },
    { id: '3', template: 'Well done, {username}!' },
  ]

  const getAllMock = vi.fn()

  beforeEach(() => {
    getAllMock.mockReset()
    ;(createTemplatesRepository as unknown as Mock).mockReturnValue({
      getAllTemplates: getAllMock,
    })
  })

  it('should return a random template from the available templates', async () => {
    getAllMock.mockResolvedValue(mockTemplates)

    const template = await getRandomTemplate(mockDb)

    expect(mockTemplates).toContainEqual(template)
    expect(getAllMock).toHaveBeenCalledOnce()
  })

  it('should throw an error if no templates are available', async () => {
    getAllMock.mockResolvedValue([])

    await expect(() => getRandomTemplate(mockDb)).rejects.toThrow(
      'No templates available'
    )
  })
})
