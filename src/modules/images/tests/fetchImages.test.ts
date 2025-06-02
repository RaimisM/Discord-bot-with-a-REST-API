import { describe, it, expect, vi, beforeEach } from 'vitest'
import createImagesManager from '@/modules/images/fetchImages'
import Logger from '@/config/configErrorLogger'

vi.mock('@/config/configErrorLogger', () => ({
  default: {
    error: vi.fn(),
    info: vi.fn(),
  },
}))

// Mock Giphy API response from fetchImages
vi.mock('../fetchImages', () => ({
  default: vi.fn(() => ({
    fetchGifs: vi.fn(async (query: string) => [
      { id: '1', url: 'https://giphy.com/gif1', title: `${query} GIF 1` },
      { id: '2', url: 'https://giphy.com/gif2', title: `${query} GIF 2` },
    ]),
  })),
}))

describe('ImagesManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('Return gifs by keywords', async () => {
    const imagesManager = createImagesManager()
    const gifs = await imagesManager.fetchGifs('sunny day')

    expect(gifs).toHaveLength(2)
    expect(gifs[0].url).toBe('https://giphy.com/gif1')
    expect(gifs[1].url).toBe('https://giphy.com/gif2')
  })

  it('show error if no API key is provided', async () => {
    const imagesManager = createImagesManager('')

    imagesManager.fetchGifs = vi.fn(async () => {
      const errorMessage = 'Giphy API key is missing'
      Logger.error(errorMessage)
      throw new Error(errorMessage)
    })

    await expect(imagesManager.fetchGifs('test')).rejects.toThrow(
      'Giphy API key is missing'
    )

    expect(Logger.error).toHaveBeenCalledWith('Giphy API key is missing')
  })
})
