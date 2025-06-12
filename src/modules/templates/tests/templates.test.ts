import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request } from 'express'
import { createTemplate } from '../templates'

const mockDb = {
  selectFrom: vi.fn(),
  insertInto: vi.fn(),
  updateTable: vi.fn(),
  deleteFrom: vi.fn(),
} as any

const mockQueryBuilder = {
  select: vi.fn().mockReturnThis(),
  execute: vi.fn(),
  values: vi.fn().mockReturnThis(),
  returning: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
}

vi.mock('../repository', async () => {
  const actual = await vi.importActual<any>('../repository')
  return {
    ...actual,
    createTemplatesRepository: () => ({
      findAll: () => mockQueryBuilder.execute(),
      create: (data: any) =>
        mockDb
          .insertInto('templates')
          .values(data)
          .returning(['id', 'text'])
          .execute()
          .then((res: any[]) => res[0]),
      update: (id: number, data: any) =>
        mockDb
          .updateTable('templates')
          .set(data)
          .where('id', '=', id)
          .returning(['id', 'text'])
          .execute()
          .then((res: any[]) => res[0]),
      remove: (id: number) =>
        mockDb
          .deleteFrom('templates')
          .where('id', '=', id)
          .execute()
          .then((res: any[]) => Number(res[0]?.numDeletedRows ?? 0)),
    }),
  }
})

const templates = createTemplate(mockDb)

beforeEach(() => {
  vi.clearAllMocks()

  mockDb.selectFrom.mockReturnValue(mockQueryBuilder)
  mockDb.insertInto.mockReturnValue(mockQueryBuilder)
  mockDb.updateTable.mockReturnValue(mockQueryBuilder)
  mockDb.deleteFrom.mockReturnValue(mockQueryBuilder)
})

describe('getTemplates', () => {
  it('should return all templates', async () => {
    const mockTemplates = [
      { id: 1, text: 'Hello {username}, sprint is {sprint}!' },
    ]
    mockQueryBuilder.execute.mockResolvedValue(mockTemplates)

    const result = await templates.getTemplates()
    expect(result).toEqual(mockTemplates)
  })
})

describe('postTemplates', () => {
  it('should create a new template', async () => {
    const mockReq = {
      body: { text: 'Hello {username}, your sprint is {sprint}!' },
    } as Request

    const mockNewTemplate = {
      id: 1,
      text: 'Hello {username}, your sprint is {sprint}!',
    }
    mockQueryBuilder.execute.mockResolvedValue([mockNewTemplate])

    const result = await templates.postTemplates(mockReq)

    expect(mockDb.insertInto).toHaveBeenCalledWith('templates')
    expect(mockQueryBuilder.values).toHaveBeenCalledWith({
      text: mockNewTemplate.text,
    })
    expect(mockQueryBuilder.returning).toHaveBeenCalledWith(['id', 'text'])
    expect(result).toEqual(mockNewTemplate)
  })
})

describe('patchTemplates', () => {
  it('should update an existing template', async () => {
    const mockReq = {
      params: { id: '1' },
      body: { text: 'Updated {username} for sprint {sprint}' },
    } as unknown as Request

    const mockUpdatedTemplate = {
      id: 1,
      text: 'Updated {username} for sprint {sprint}',
    }
    mockQueryBuilder.execute.mockResolvedValue([mockUpdatedTemplate])

    const result = await templates.patchTemplates(mockReq)

    expect(mockDb.updateTable).toHaveBeenCalledWith('templates')
    expect(mockQueryBuilder.set).toHaveBeenCalledWith({
      text: mockUpdatedTemplate.text,
    })
    expect(mockQueryBuilder.where).toHaveBeenCalledWith('id', '=', 1)
    expect(mockQueryBuilder.returning).toHaveBeenCalledWith(['id', 'text'])
    expect(result).toEqual(mockUpdatedTemplate)
  })

  it('should throw if template not found', async () => {
    const mockReq = {
      params: { id: '1' },
      body: { text: 'Updated {username} for sprint {sprint}' },
    } as unknown as Request

    mockQueryBuilder.execute.mockResolvedValue([])

    await expect(templates.patchTemplates(mockReq)).rejects.toThrow(
      'Template not found'
    )
  })
})

describe('deleteTemplates', () => {
  it('should delete a template', async () => {
    const mockReq = {
      params: { id: '1' },
    } as unknown as Request

    mockQueryBuilder.execute.mockResolvedValue([{ numDeletedRows: 1 }])

    const result = await templates.deleteTemplates(mockReq)

    expect(mockDb.deleteFrom).toHaveBeenCalledWith('templates')
    expect(mockQueryBuilder.where).toHaveBeenCalledWith('id', '=', 1)
    expect(result).toEqual({ success: true })
  })

  it('should throw if template not found', async () => {
    const mockReq = {
      params: { id: '1' },
    } as unknown as Request

    mockQueryBuilder.execute.mockResolvedValue([{ numDeletedRows: 0 }])

    await expect(templates.deleteTemplates(mockReq)).rejects.toThrow(
      'Template not found'
    )
  })
})
