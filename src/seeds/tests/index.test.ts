import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import createDb from '@/database'
import { seedTemplates } from '../seedTemplates'
import { seedSprints } from '../seedSprints'
import { runAllSeeds } from '../index'

vi.mock('@/database')
vi.mock('../seedTemplates')
vi.mock('../seedSprints')

const mockExecute = vi.fn()
const mockDeleteFrom = vi.fn(() => ({ execute: mockExecute }))
const mockDb = { destroy: vi.fn(), deleteFrom: mockDeleteFrom }

describe('seeds/index', () => {
  const originalExit = process.exit
  const mockExit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createDb).mockReturnValue(mockDb as any)
    vi.mocked(seedTemplates).mockResolvedValue(undefined)
    vi.mocked(seedSprints).mockResolvedValue(undefined)
    process.exit = mockExit as any
  })

  afterEach(() => {
    process.exit = originalExit
  })

  it('creates database with correct path', async () => {
    await runAllSeeds({ exitOnFinish: false })
    expect(createDb).toHaveBeenCalledWith('data/database.db')
  })

  it('clears all tables before seeding', async () => {
    await runAllSeeds({ exitOnFinish: false })
    expect(mockDeleteFrom).toHaveBeenCalledWith('messages')
    expect(mockDeleteFrom).toHaveBeenCalledWith('templates')
    expect(mockDeleteFrom).toHaveBeenCalledWith('sprints')
  })

  it('calls seedTemplates with database', async () => {
    await runAllSeeds({ exitOnFinish: false })
    expect(seedTemplates).toHaveBeenCalledWith(mockDb)
  })

  it('calls seedSprints with database', async () => {
    await runAllSeeds({ exitOnFinish: false })
    expect(seedSprints).toHaveBeenCalledWith(mockDb)
  })

  it('logs success message', async () => {
    const mockLog = vi.spyOn(console, 'log').mockImplementation(() => {})
    await runAllSeeds({ exitOnFinish: false })
    expect(mockLog).toHaveBeenCalledWith('All seeds completed successfully!')
    mockLog.mockRestore()
  })

  it('handles seeding errors gracefully', async () => {
    vi.mocked(seedTemplates).mockRejectedValueOnce(new Error('Seeding failed'))
    const mockError = vi.spyOn(console, 'error').mockImplementation(() => {})
    await runAllSeeds({ exitOnFinish: false })
    expect(mockError).toHaveBeenCalledWith('Seeding failed:', expect.any(Error))
    mockError.mockRestore()
  })

  it('calls process.exit(0) on success when exitOnFinish is true', async () => {
    await runAllSeeds({ exitOnFinish: true })
    expect(mockExit).toHaveBeenCalledWith(0)
  })

  it('calls process.exit(1) on failure when exitOnFinish is true', async () => {
    vi.mocked(seedTemplates).mockRejectedValueOnce(new Error('Seed error'))
    await runAllSeeds({ exitOnFinish: true })
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('calls db.destroy() after success', async () => {
    await runAllSeeds({ exitOnFinish: false })
    expect(mockDb.destroy).toHaveBeenCalled()
  })

  it('calls db.destroy() after failure', async () => {
    vi.mocked(seedSprints).mockRejectedValueOnce(new Error('Boom'))
    await runAllSeeds({ exitOnFinish: false })
    expect(mockDb.destroy).toHaveBeenCalled()
  })

  it('handles createDb failure', async () => {
    const mockError = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(createDb).mockImplementationOnce(() => {
      throw new Error('Database creation failed')
    })

    await runAllSeeds({ exitOnFinish: false })
    expect(mockError).toHaveBeenCalledWith('Seeding failed:', expect.any(Error))
    mockError.mockRestore()
  })
})
