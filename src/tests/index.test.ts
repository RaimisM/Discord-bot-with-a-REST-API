import { vi, describe, it, expect, beforeEach, afterEach, Mock } from 'vitest'
import createDatabase from '../database'
import Logger from '@/config/configErrorLogger'
import { startServer } from '../index'

vi.mock('../database', () => ({
  default: vi.fn(),
}))
vi.mock('../app', () => ({
  default: vi.fn(() => ({
    listen: vi.fn((port, cb) => cb()),
  })),
}))
vi.mock('@/modules/images/getImages', () => ({
  default: vi.fn(),
}))
vi.mock('@/modules/images/loadImages', () => ({
  default: vi.fn(),
}))
vi.mock('@/config/configErrorLogger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}))

describe('startServer', () => {
  let originalExit: typeof process.exit

  beforeEach(() => {
    originalExit = process.exit
    process.exit = vi.fn() as unknown as typeof process.exit
    vi.clearAllMocks()
  })

  afterEach(() => {
    process.exit = originalExit
  })

  it('logs error and exits if createDatabase throws', async () => {
    const errorMsg = 'Failed to connect to DB'
    ;(createDatabase as unknown as Mock).mockImplementation(() => {
      throw new Error(errorMsg)
    })

    await startServer()

    expect(Logger.error).toHaveBeenCalledWith(
      expect.stringContaining(`Server failed to start: ${errorMsg}`)
    )
    expect(process.exit).toHaveBeenCalledWith(1)
  })
})
