import { vi, describe, afterEach, test, expect } from 'vitest'
import saveImages from '../saveImages'
import type { Image } from '../getImages'

type Database = any

const mockInsertImage = vi.fn()
const mockDeleteImage = vi.fn()

vi.mock('../repository', () => ({
  default: vi.fn(() => ({
    insertImage: mockInsertImage,
    deleteImage: mockDeleteImage,
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
    expect(mockInsertImage).not.toHaveBeenCalled()
    expect(mockDeleteImage).toHaveBeenCalledTimes(1)
  })

  test('should insert and delete images correctly', async () => {
    const images: Image[] = [
      { id: '1', url: 'image1.jpg', title: 'Image 1' },
      { id: '2', url: 'image2.jpg', title: 'Image 2' },
    ]

    const result = await saveImages(db, images)

    expect(mockDeleteImage).toHaveBeenCalledTimes(1)
    expect(mockInsertImage).toHaveBeenCalledTimes(1)
    expect(mockInsertImage).toHaveBeenCalledWith(images)
    expect(result).toBe(true)
  })

  test('should throw if deleteImage fails', async () => {
    mockDeleteImage.mockImplementationOnce(() => {
      throw new Error('DB error on delete')
    })

    const images: Image[] = [{ id: '1', url: 'image1.jpg', title: 'Image 1' }]

    await expect(saveImages(db, images)).rejects.toThrow('DB error on delete')
    expect(mockInsertImage).not.toHaveBeenCalled()
    expect(mockDeleteImage).toHaveBeenCalledTimes(1)
  })

  test('should throw if insertImage fails', async () => {
    mockInsertImage.mockImplementationOnce(() => {
      throw new Error('DB error on insert')
    })

    const images: Image[] = [{ id: '1', url: 'image1.jpg', title: 'Image 1' }]

    await expect(saveImages(db, images)).rejects.toThrow('DB error on insert')
    expect(mockDeleteImage).toHaveBeenCalledTimes(1)
    expect(mockInsertImage).toHaveBeenCalledTimes(1)
  })
})
