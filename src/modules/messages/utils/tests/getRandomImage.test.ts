import getRandomImageUrl from '../getRandomImage'
import { Image } from '@/modules/images/getImages'

describe('getRandomImageUrl', () => {
  test('should throw an error if no images are provided', () => {
    expect(() => getRandomImageUrl([])).toThrow('No images available')
  })

  test('should return a valid image URL from the list', () => {
    const images: Image[] = [
      { id: '1', url: 'https://example.com/image1.jpg', title: 'Image 1' },
      { id: '2', url: 'https://example.com/image2.jpg', title: 'Image 2' },
      { id: '3', url: 'https://example.com/image3.jpg', title: 'Image 3' },
    ]

    const result = getRandomImageUrl(images)

    const urls = images.map((img) => img.url)
    expect(urls).toContain(result)
  })
})
