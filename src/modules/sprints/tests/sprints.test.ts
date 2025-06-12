import type { Request } from 'express'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sprintManager } from '../sprints'
import type { Database } from '@/database'
import NotFound from '@/utils/errors/NotFound'
import BadRequest from '@/utils/errors/BadRequest'

const mockRepo = {
  findAll: vi.fn(),
  findByName: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  remove: vi.fn(),
}

const createMockDb = (): Database => ({ kysely: {} }) as any

const createMockExpressRequest = (data: Partial<Request> = {}): Request =>
  ({
    body: {},
    params: {},
    query: {},
    ...data,
  }) as Request

vi.mock('../repository', () => ({
  default: () => mockRepo,
}))

vi.mock('../validator', () => ({
  default: () => ({
    parseSprintId: vi.fn((x) => x),
    parseSprintQuery: vi.fn((x) => x),
    parseSprint: vi.fn((x) => x),
    parseSprintUpdatable: vi.fn((x) => x),
  }),
}))

describe('sprintManager', () => {
  let manager: ReturnType<typeof sprintManager>

  beforeEach(() => {
    vi.clearAllMocks()
    manager = sprintManager(createMockDb())
  })

  describe('postSprints', () => {
    it('should create a new sprint when valid and not duplicate', async () => {
      const requestBody = {
        sprintName: 'Sprint A',
        topicName: 'Topic 1',
        id: 1,
      }
      const request = createMockExpressRequest({
        body: requestBody,
      })

      mockRepo.findByName.mockResolvedValue(undefined)
      mockRepo.create.mockResolvedValue({
        id: 1,
        sprintName: 'Sprint A',
        topicName: 'Topic 1',
      })

      const result = await manager.postSprints(request)

      expect(mockRepo.create).toHaveBeenCalledWith({
        sprintName: 'Sprint A',
        topicName: 'Topic 1',
        id: 1,
      })
      expect(result).toEqual({
        id: 1,
        sprintName: 'Sprint A',
        topicName: 'Topic 1',
      })
    })

    it('should throw BadRequest if sprint name already exists', async () => {
      const requestBody = {
        sprintName: 'Sprint A',
        topicName: 'Topic 1',
        id: 1,
      }
      const request = createMockExpressRequest({
        body: requestBody,
      })

      mockRepo.findByName.mockResolvedValue({
        id: 1,
        sprintName: 'Sprint A',
        topicName: 'Topic 1',
      })

      await expect(manager.postSprints(request)).rejects.toThrow(BadRequest)
    })
  })

  describe('deleteSprints', () => {
    describe('deleteSprints', () => {
      it('should delete an existing sprint and return success message', async () => {
        const request = createMockExpressRequest({
          params: { id: '123' },
        })

        mockRepo.findById.mockResolvedValue({
          id: 123,
          sprintName: 'Sprint X',
          topicName: 'Topic Y',
        })
        mockRepo.remove.mockResolvedValue({ numDeletedRows: BigInt(1) })

        const result = await manager.deleteSprints(request)
        expect(mockRepo.findById).toHaveBeenCalledWith(123)
        expect(mockRepo.remove).toHaveBeenCalledWith(123)
        expect(result).toEqual({ message: 'Sprint deleted successfully' })
      })
    })

    it('should throw NotFound if sprint does not exist', async () => {
      const request = createMockExpressRequest({
        params: { id: '999' },
      })
      mockRepo.findById.mockResolvedValue(undefined)

      await expect(manager.deleteSprints(request)).rejects.toThrow(NotFound)
    })
  })
})
