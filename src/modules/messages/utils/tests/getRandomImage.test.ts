import getRandomImage from '../getRandomImage'
import createImagesRepository from '@/modules/images/repository'
import type { Database } from '@/database'

vi.mock('@/modules/images/repository')

describe('getRandomImage', () => {
  const mockDb = {} as Database
  const mockGetImages = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    const mockedCreateImagesRepo = vi.mocked(createImagesRepository)
    mockedCreateImagesRepo.mockReturnValue({ getImages: mockGetImages } as any)
  })

  test('should throw an error if no images are returned', async () => {
    mockGetImages.mockResolvedValueOnce([])

    await expect(getRandomImage(mockDb)).rejects.toThrow(
      'No images available in the database'
    )
  })

  test('should throw an error if selected image has no URL', async () => {
    mockGetImages.mockResolvedValueOnce([
      { id: '1', url: '', title: 'Image 1' },
    ])

    await expect(getRandomImage(mockDb)).rejects.toThrow(
      'Selected image has no URL'
    )
  })

  test('should return a valid image URL when images are available', async () => {
    const images = [
      { id: '1', url: 'https://example.com/image1.jpg', title: 'Image 1' },
      { id: '2', url: 'https://example.com/image2.jpg', title: 'Image 2' },
      { id: '3', url: 'https://example.com/image3.jpg', title: 'Image 3' },
    ]
    mockGetImages.mockResolvedValueOnce(images)

    const result = await getRandomImage(mockDb)

    if (typeof result === 'string') {
      throw new Error(
        'Expected result to be an object with url, but got string'
      )
    }

    expect(images.map((img) => img.url)).toContain(result.url)
  })
})
