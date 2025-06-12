import { vi, describe, afterEach, test, expect } from 'vitest'
import saveImages from '../saveImages'
import type { Image } from '../getImages'

type Database = any

const mockInsertImages = vi.fn()
const mockDeleteImages = vi.fn()

vi.mock('../repository', () => ({
  default: vi.fn(() => ({
    insertImages: mockInsertImages,
    deleteImages: mockDeleteImages,
  })),
}))

describe('saveImages', () => {
  const db = {} as Database

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('should throw if no images are provided', async () => {
    const images: Image[] = []

    await expect(saveImages(db, images)).rejects.toThrow(
      'There are no images to save'
    )
    expect(mockInsertImages).not.toHaveBeenCalled()
    expect(mockDeleteImages).toHaveBeenCalledTimes(1)
  })

  test('should insert and delete images correctly', async () => {
    const images: Image[] = [
      { id: '1', url: 'image1.jpg', title: 'Image 1' },
      { id: '2', url: 'image2.jpg', title: 'Image 2' },
    ]

    const result = await saveImages(db, images)

    expect(mockDeleteImages).toHaveBeenCalledTimes(1)
    expect(mockInsertImages).toHaveBeenCalledTimes(1)
    expect(mockInsertImages).toHaveBeenCalledWith([
      { url: 'image1.jpg' },
      { url: 'image2.jpg' }
    ])
    expect(result).toBe(true)
  })

  test('should throw if deleteImages fails', async () => {
    mockDeleteImages.mockImplementationOnce(() => {
      throw new Error('DB error on delete')
    })

    const images: Image[] = [{ id: '1', url: 'image1.jpg', title: 'Image 1' }]

    await expect(saveImages(db, images)).rejects.toThrow('DB error on delete')
    expect(mockInsertImages).not.toHaveBeenCalled()
    expect(mockDeleteImages).toHaveBeenCalledTimes(1)
  })

  test('should throw if insertImages fails', async () => {
    mockInsertImages.mockImplementationOnce(() => {
      throw new Error('DB error on insert')
    })

    const images: Image[] = [{ id: '1', url: 'image1.jpg', title: 'Image 1' }]

    await expect(saveImages(db, images)).rejects.toThrow('DB error on insert')
    expect(mockDeleteImages).toHaveBeenCalledTimes(1)
    expect(mockInsertImages).toHaveBeenCalledTimes(1)
  })
})