import createImageRepository from './repository'
import { Image } from './getImages'

type Database = any

export default async function saveImages(
  db: Database,
  images: Image[]
): Promise<boolean> {
  const repository = createImageRepository(db)

  try {
    await repository.deleteImages()
  } catch (error) {
    throw new Error(
      (error as Error).message || 'Failed to delete existing images'
    )
  }

  if (!images || images.length === 0) {
    throw new Error('There are no images to save')
  }

  try {
    const imagesToInsert = images.map((image) => ({
      url: image.url,
    }))

    await repository.insertImages(imagesToInsert)
    return true
  } catch (error) {
    throw new Error((error as Error).message || 'Failed to insert new images')
  }
}
