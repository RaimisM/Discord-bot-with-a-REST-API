import { Image } from '@/modules/images/getImages'

export default function getRandomImageUrl(images: Image[]): string {
  if (!images.length) {
    throw new Error('No images available')
  }

  const index = Math.floor(Math.random() * images.length)
  return images[index].url
}
