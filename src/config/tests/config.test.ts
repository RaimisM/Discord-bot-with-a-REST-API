import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('@/config/configErrorLogger', () => ({
  default: {
    error: vi.fn(),
  },
}))

describe('validateEnv (from config.ts)', () => {
  const ORIGINAL_ENV = process.env
  const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
    throw new Error('process.exit called')
  })

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...ORIGINAL_ENV }
  })

  afterEach(() => {
    process.env = ORIGINAL_ENV
    vi.clearAllMocks()
  })

  it('returns config when all env vars are present', async () => {
    process.env = {
      ...process.env,
      DATABASE_URL: 'postgres://db',
      DISCORD_TOKEN_ID: 'abc',
      DISCORD_CHANNEL_ID: '123',
      GIPHY_API_KEY: 'giphy-123',
      NODE_ENV: 'development',
    }

    const configModule = await import('@/config/config')
    expect(configModule.DATABASE_URL).toBe('postgres://db')
    expect(configModule.DISCORD_TOKEN_ID).toBe('abc')
    expect(configModule.DISCORD_CHANNEL_ID).toBe('123')
    expect(configModule.GIPHY_API_KEY).toBe('giphy-123')
  })

  it('logs error and exits if any env var is missing', async () => {
    process.env = {
      NODE_ENV: 'development',
      DATABASE_URL: '',
      DISCORD_TOKEN_ID: '',
      DISCORD_CHANNEL_ID: '',
      GIPHY_API_KEY: '',
    }

    const Logger = (await import('@/config/configErrorLogger')).default

    try {
      await import('@/config/config')
    } catch (err) {
      expect(Logger.error).toHaveBeenCalledWith(
        expect.stringContaining('DATABASE_URL')
      )
      expect(Logger.error).toHaveBeenCalledWith(
        expect.stringContaining('DISCORD_TOKEN_ID')
      )
      expect(mockExit).toHaveBeenCalledWith(1)
    }
  })
})
