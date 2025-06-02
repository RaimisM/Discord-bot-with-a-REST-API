import saveImages from './saveImages'
import { ImagesManager } from './getImages'

type Database = any

export default async function loadImages(
  db: Database,
  imagesManager: ImagesManager,
  query: string
) {
  const images = await imagesManager.getGifs(query)

  if (!Array.isArray(images) || images.length === 0) {
    throw new Error(`No images found for query: "${query}"`)
  }

  try {
    await saveImages(db, images)
  } catch (error) {
    throw new Error(`Failed to save images: ${(error as Error).message}`)
  }

  return images
}
