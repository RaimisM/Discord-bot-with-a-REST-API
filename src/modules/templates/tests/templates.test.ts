import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request } from 'express'
import { createTemplate } from '../templates'
import type { Database } from '@/database'

// Mock query builder
const mockQueryBuilder = {
  selectAll: vi.fn().mockReturnThis(),
  execute: vi.fn(),
  values: vi.fn().mockReturnThis(),
  returning: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
}

// Mock database
const mockDb = {
  selectFrom: vi.fn().mockReturnValue(mockQueryBuilder),
  insertInto: vi.fn().mockReturnValue(mockQueryBuilder),
  updateTable: vi.fn().mockReturnValue(mockQueryBuilder),
  deleteFrom: vi.fn().mockReturnValue(mockQueryBuilder),
} as unknown as Database

describe('createTemplate', () => {
  const templates = createTemplate(mockDb)

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset the mock query builder
    Object.values(mockQueryBuilder).forEach(mock => {
      if (typeof mock === 'function') {
        mock.mockReturnThis?.()
      }
    })
  })

  describe('getTemplates', () => {
    it('should return all templates', async () => {
      const mockTemplates = [
        { id: 1, text: 'Template 1' },
        { id: 2, text: 'Template 2' }
      ]
      mockQueryBuilder.execute.mockResolvedValue(mockTemplates)

      const result = await templates.getTemplates()

      expect(mockDb.selectFrom).toHaveBeenCalledWith('templates')
      expect(mockQueryBuilder.selectAll).toHaveBeenCalled()
      expect(result).toEqual(mockTemplates)
    })
  })

  describe('postTemplates', () => {
    it('should create a new template', async () => {
      const mockReq = {
        body: { text: 'New template' }
      } as Request

      const mockNewTemplate = { id: 1, text: 'New template' }
      mockQueryBuilder.execute.mockResolvedValue([mockNewTemplate])

      const result = await templates.postTemplates(mockReq)

      expect(mockDb.insertInto).toHaveBeenCalledWith('templates')
      expect(mockQueryBuilder.values).toHaveBeenCalledWith({ text: 'New template' })
      expect(mockQueryBuilder.returning).toHaveBeenCalledWith(['id', 'text'])
      expect(result).toEqual(mockNewTemplate)
    })
  })

  describe('patchTemplates', () => {
    it('should update an existing template', async () => {
      const mockReq = {
        params: { id: '1' },
        body: { text: 'Updated template' }
      } as unknown as Request

      const mockUpdatedTemplate = { id: 1, text: 'Updated template' }
      mockQueryBuilder.execute.mockResolvedValue([mockUpdatedTemplate])

      const result = await templates.patchTemplates(mockReq)

      expect(mockDb.updateTable).toHaveBeenCalledWith('templates')
      expect(mockQueryBuilder.set).toHaveBeenCalledWith({ text: 'Updated template' })
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('id', '=', 1)
      expect(mockQueryBuilder.returning).toHaveBeenCalledWith(['id', 'text'])
      expect(result).toEqual(mockUpdatedTemplate)
    })
  })

  describe('deleteTemplates', () => {
    it('should delete a template', async () => {
      const mockReq = {
        params: { id: '1' }
      } as unknown as Request

      mockQueryBuilder.execute.mockResolvedValue(undefined)

      const result = await templates.deleteTemplates(mockReq)

      expect(mockDb.deleteFrom).toHaveBeenCalledWith('templates')
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('id', '=', 1)
      expect(result).toEqual({ success: true })
    })
  })
})