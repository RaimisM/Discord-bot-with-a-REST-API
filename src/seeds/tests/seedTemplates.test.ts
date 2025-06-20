import { vi, describe, test, expect } from 'vitest'
import { seedTemplates } from '../seedTemplates'
import { templates } from '@/modules/templates/data/templateData'

vi.mock('@/modules/templates/repository', () => ({
  createTemplatesRepository: () => ({
    create: vi.fn().mockResolvedValue(undefined),
  }),
}))

describe('seedTemplates', () => {
  test('should insert all templates', async () => {
    const mockDb = {}
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await seedTemplates(mockDb)

    expect(consoleSpy).toHaveBeenCalledWith(`Seeded ${templates.length} templates`)
    consoleSpy.mockRestore()
  })
})
