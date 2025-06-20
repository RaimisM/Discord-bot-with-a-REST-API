import { vi, describe, test, expect } from 'vitest'
import { seedSprints } from '../seedSprints'
import { sprints } from '@/modules/sprints/data/sprintData'

vi.mock('@/modules/sprints/repository', () => ({
  default: () => ({
    create: vi.fn().mockResolvedValue(undefined),
  }),
}))

describe('seedSprints', () => {
  test('should insert all sprints', async () => {
    const mockDb = {}
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await seedSprints(mockDb)

    expect(consoleSpy).toHaveBeenCalledWith(`Seeded ${sprints.length} sprints`)
    consoleSpy.mockRestore()
  })
})
