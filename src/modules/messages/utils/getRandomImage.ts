import type { Database } from '@/database'
import createImagesRepository from '@/modules/images/repository'

export type Image = { url: string }

export default async function getRandomImage(
  db: Database
): Promise<Image | string> {
  const imagesRepo = createImagesRepository(db)
  const images = await imagesRepo.getImages()

  if (!images.length) {
    throw new Error('No images available in the database')
  }

  const index = Math.floor(Math.random() * images.length)
  const image = images[index]

  if (!image.url) {
    throw new Error('Selected image has no URL')
  }

  return { url: image.url }
}
