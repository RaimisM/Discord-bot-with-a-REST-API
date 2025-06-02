import { vi, describe, test, expect, afterEach, Mock } from 'vitest'
import loadImages from '../loadImages'
import saveImages from '../saveImages'
import { ImagesManager } from '../getImages'

vi.mock('../saveImages')

type Database = any
const mockDb: Database = {}

const mockImagesManager: ImagesManager = {
  getGifs: vi.fn(),
}

describe('loadImages', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  test('loads and saves images successfully', async () => {
    const mockImages = [
      { id: '1', url: 'https://example.com/1.gif', title: 'funny gif 1' },
      { id: '2', url: 'https://example.com/2.gif', title: 'funny gif 2' },
    ]

    ;(mockImagesManager.getGifs as Mock).mockResolvedValueOnce(mockImages)
    ;(saveImages as Mock).mockResolvedValueOnce(true)

    const result = await loadImages(mockDb, mockImagesManager, 'funny')

    expect(mockImagesManager.getGifs).toHaveBeenCalledWith('funny')
    expect(saveImages).toHaveBeenCalledWith(mockDb, mockImages)
    expect(result).toEqual(mockImages)
  })

  test('throws if no images are returned', async () => {
    ;(mockImagesManager.getGifs as Mock).mockResolvedValueOnce([])

    await expect(
      loadImages(mockDb, mockImagesManager, 'empty')
    ).rejects.toThrow('No images found')

    expect(mockImagesManager.getGifs).toHaveBeenCalledWith('empty')
    expect(saveImages).not.toHaveBeenCalled()
  })

  test('throws if getGifs fails', async () => {
    ;(mockImagesManager.getGifs as Mock).mockRejectedValueOnce(
      new Error('API error')
    )

    await expect(loadImages(mockDb, mockImagesManager, 'fail')).rejects.toThrow(
      'API error'
    )

    expect(mockImagesManager.getGifs).toHaveBeenCalledWith('fail')
    expect(saveImages).not.toHaveBeenCalled()
  })

  test('throws if saveImages fails', async () => {
    const mockImages = [
      { id: '1', url: 'https://example.com/1.gif', title: 'fail gif' },
    ]

    ;(mockImagesManager.getGifs as Mock).mockResolvedValueOnce(mockImages)
    ;(saveImages as Mock).mockRejectedValueOnce(new Error('DB insert error'))

    await expect(loadImages(mockDb, mockImagesManager, 'fail')).rejects.toThrow(
      'DB insert error'
    )

    expect(mockImagesManager.getGifs).toHaveBeenCalledWith('fail')
    expect(saveImages).toHaveBeenCalledWith(mockDb, mockImages)
  })
})
