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
const req = (partial: Partial<Request> = {}): Request =>
  ({ body: {}, params: {}, query: {}, ...partial }) as Request

vi.mock('../repository', () => ({
  default: () => mockRepo,
}))
const validatorSpies = {
  parseSprintId: vi.fn((x) => x),
  parseSprintQuery: vi.fn((x) => x),
  parseSprint: vi.fn((x) => x),
  parseSprintUpdatable: vi.fn((x) => x),
}
vi.mock('../validator', () => ({
  default: () => validatorSpies,
}))

describe('sprintManager', () => {
  let manager: ReturnType<typeof sprintManager>

  beforeEach(() => {
    vi.clearAllMocks()
    manager = sprintManager(createMockDb())
  })

  describe('getSprints', () => {
    const sprintA = { id: 1, sprintCode: 'A', topicName: 'Alpha' }
    const sprintB = { id: 2, sprintCode: 'B', topicName: 'Beta' }

    it('returns all sprints when no query params', async () => {
      mockRepo.findAll.mockResolvedValue([sprintA, sprintB])
      const out = await manager.getSprints(req())
      expect(out).toEqual([sprintA, sprintB])
      expect(validatorSpies.parseSprintQuery).toHaveBeenCalled()
    })

    it('filters by id', async () => {
      mockRepo.findAll.mockResolvedValue([sprintA, sprintB])
      const out = await manager.getSprints(req({ query: { id: '2' } }))
      expect(out).toEqual([sprintB])
    })

    it('filters by sprintCode', async () => {
      mockRepo.findAll.mockResolvedValue([sprintA, sprintB])
      const out = await manager.getSprints(req({ query: { sprintCode: 'A' } }))
      expect(out).toEqual([sprintA])
    })

    it('throws NotFound when sprintCode filter has no match', async () => {
      mockRepo.findAll.mockResolvedValue([sprintA])
      await expect(
        manager.getSprints(req({ query: { sprintCode: 'ZZ' } }))
      ).rejects.toThrow(NotFound)
    })

    it('applies limit', async () => {
      mockRepo.findAll.mockResolvedValue([sprintA, sprintB])
      const out = await manager.getSprints(req({ query: { limit: '1' } }))
      expect(out).toEqual([sprintA])
    })
  })

  describe('postSprints', () => {
    const body = { sprintCode: 'Sprint A', topicName: 'Topic 1', id: 1 }

    it('creates a new sprint when not duplicate', async () => {
      mockRepo.findByName.mockResolvedValue(undefined)
      mockRepo.create.mockResolvedValue({ ...body })

      const result = await manager.postSprints(req({ body }))
      expect(mockRepo.create).toHaveBeenCalledWith(body)
      expect(result).toEqual(body)
    })

    it('throws BadRequest if sprint exists', async () => {
      mockRepo.findByName.mockResolvedValue(body)
      await expect(manager.postSprints(req({ body }))).rejects.toThrow(
        BadRequest
      )
    })
  })

  describe('patchSprints', () => {
    const existing = { id: 7, sprintCode: 'OLD', topicName: 'X' }

    it('updates an existing sprint', async () => {
      mockRepo.findById.mockResolvedValue(existing)
      mockRepo.remove.mockResolvedValue({ numDeletedRows: 1n })
      mockRepo.create.mockResolvedValue({ ...existing, topicName: 'NEW' })

      const request = req({
        params: { id: '7' },
        body: { topicName: 'NEW' },
      })
      const out = await manager.patchSprints(request)

      expect(mockRepo.remove).toHaveBeenCalledWith(7)
      expect(mockRepo.create).toHaveBeenCalledWith({
        id: 7,
        sprintCode: 'OLD',
        topicName: 'NEW',
      })
      expect(out.topicName).toBe('NEW')
    })

    it('throws NotFound if id does not exist', async () => {
      mockRepo.findById.mockResolvedValue(undefined)
      await expect(
        manager.patchSprints(req({ params: { id: '99' }, body: {} }))
      ).rejects.toThrow(NotFound)
    })
  })

  describe('deleteSprints', () => {
    it('deletes an existing sprint', async () => {
      mockRepo.findById.mockResolvedValue({
        id: 123,
        sprintCode: 'X',
        topicName: 'Y',
      })
      mockRepo.remove.mockResolvedValue({ numDeletedRows: 1n })

      const res = await manager.deleteSprints(req({ params: { id: '123' } }))
      expect(mockRepo.remove).toHaveBeenCalledWith(123)
      expect(res).toEqual({ message: 'Sprint deleted successfully' })
    })

    it('throws NotFound if sprint is absent', async () => {
      mockRepo.findById.mockResolvedValue(undefined)
      await expect(
        manager.deleteSprints(req({ params: { id: '999' } }))
      ).rejects.toThrow(NotFound)
    })

    it('throws Error if repo.remove returns 0 rows', async () => {
      mockRepo.findById.mockResolvedValue({
        id: 1,
        sprintCode: 'X',
        topicName: 'Y',
      })
      mockRepo.remove.mockResolvedValue({ numDeletedRows: 0n })

      await expect(
        manager.deleteSprints(req({ params: { id: '1' } }))
      ).rejects.toThrow('Failed to delete sprint')
    })
  })
})
