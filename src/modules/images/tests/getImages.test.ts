import { describe, it, expect, vi, beforeEach } from 'vitest'
import createImagesManager from '@/modules/images/getImages'
import Logger from '@/config/configErrorLogger'

global.fetch = vi.fn()

vi.mock('@/config/configErrorLogger', () => ({
  default: {
    error: vi.fn(),
    info: vi.fn(),
  },
}))

describe('ImagesManager', () => {
  const mockApiKey = 'fake-api-key'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns gifs by keywords', async () => {
    const mockResponse = {
      data: [
        {
          id: '1',
          title: 'Test GIF 1',
          images: { original: { url: 'https://giphy.com/gif1' } },
        },
        {
          id: '2',
          title: 'Test GIF 2',
          images: { original: { url: 'https://giphy.com/gif2' } },
        },
      ],
    }

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const manager = createImagesManager(mockApiKey)
    const gifs = await manager.getGifs('test')

    expect(gifs).toHaveLength(2)
    expect(gifs[0]).toEqual({
      id: '1',
      url: 'https://giphy.com/gif1',
      title: 'Test GIF 1',
    })
  })

  it('logs and throws error if no API key is provided', async () => {
    const manager = createImagesManager(undefined)

    await expect(manager.getGifs('cat')).rejects.toThrow(
      'Giphy API key is missing'
    )
    expect(Logger.error).toHaveBeenCalledWith('Giphy API key is missing')
  })

  it('logs and throws error on fetch failure', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

    const manager = createImagesManager(mockApiKey)

    await expect(manager.getGifs('fail')).rejects.toThrow(
      /Failed to fetch GIFs from Giphy/
    )
    expect(Logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to fetch GIFs from Giphy')
    )
  })

  it('logs and throws error if response is not ok', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({}),
    } as Response)

    const manager = createImagesManager(mockApiKey)

    await expect(manager.getGifs('unauthorized')).rejects.toThrow(
      'Failed to fetch GIFs from Giphy: Error: Giphy API returned status 403'
    )

    expect(Logger.error).toHaveBeenCalledWith(
      'Failed to fetch GIFs from Giphy: Error: Giphy API returned status 403'
    )
  })
})
