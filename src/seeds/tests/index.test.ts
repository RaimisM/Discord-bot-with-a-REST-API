import { describe, it, expect, vi, beforeEach } from 'vitest'
import createDb from '@/database'
import { seedTemplates } from '../seedTemplates'
import { seedSprints } from '../seedSprints'
import { runAllSeeds } from '../index'

vi.mock('@/database')
vi.mock('../seedTemplates')
vi.mock('../seedSprints')

const mockDb = { destroy: vi.fn() }

describe('seeds/index', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createDb).mockReturnValue(mockDb as any)
    vi.mocked(seedTemplates).mockResolvedValue(undefined)
    vi.mocked(seedSprints).mockResolvedValue(undefined)
  })

  it('creates database with correct path', async () => {
    await runAllSeeds({ exitOnFinish: false })
    expect(createDb).toHaveBeenCalledWith('data/database.db')
  })

  it('calls seedTemplates with database', async () => {
    await runAllSeeds({ exitOnFinish: false })
    expect(seedTemplates).toHaveBeenCalledWith(mockDb)
  })

  it('calls seedSprints with database', async () => {
    await runAllSeeds({ exitOnFinish: false })
    expect(seedSprints).toHaveBeenCalledWith(mockDb)
  })

  it('handles seeding errors gracefully', async () => {
    vi.mocked(seedTemplates).mockRejectedValueOnce(new Error('Seeding failed'))
    const mockError = vi.spyOn(console, 'error').mockImplementation(() => {})
    await runAllSeeds({ exitOnFinish: false })
    expect(mockError).toHaveBeenCalledWith('Seeding failed:', expect.any(Error))
  })

  it('logs success message', async () => {
    const mockLog = vi.spyOn(console, 'log').mockImplementation(() => {})
    await runAllSeeds({ exitOnFinish: false })
    expect(mockLog).toHaveBeenCalledWith('All seeds completed successfully!')
  })
})
