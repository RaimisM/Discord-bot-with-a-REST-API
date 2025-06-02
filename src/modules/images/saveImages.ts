import createImageRepository from './repository'
import { Image } from './fetchImages'

type Database = any

export default async function saveImages(db: Database, images: Images[]): Promise<boolean> {
    const repository = createImageRepository(db)

    try {
        await repository.deleteImage()
    } catch (error) {
        throw new Error((error as Error).message || 'Failed to delete existing images')
    }
    if (!images ||images.length === 0) {
        throw new Error('There is no images to save')
    }
    try {
        await repository.insertImage(images)
        return true
    } catch (error) {
        throw new Error((error as Error).message || 'Failed to insert new images')
    }
}