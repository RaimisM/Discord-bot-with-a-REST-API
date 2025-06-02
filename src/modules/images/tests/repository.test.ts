import { describe, beforeAll, afterAll, beforeEach, it, expect } from 'vitest'
import createImageRepository from '../repository'
import createTestDatabase from '../../../../tests/utils/createTestDatabase'
import cleanDatabase from '../../../../tests/utils/createTestDatabase/databaseCleaner'

let db: any
let repository: ReturnType<typeof createImageRepository>

beforeAll(async () => {
  const testDb = await createTestDatabase()
  db = testDb.db
  repository = createImageRepository(db)
  await cleanDatabase(db)
})

afterAll(async () => {
  await cleanDatabase(db)
  await db.destroy()
})

beforeEach(async () => {
  await cleanDatabase(db)
})

describe('ImagesRepository', () => {
  it('should retrieve all images', async () => {
    await repository.insertImages([
      { url: 'url1' },
      { url: 'url2' },
      { url: 'url3' },
    ])

    const images = await repository.getImages()
    expect(images).toHaveLength(3)
    expect(images).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: 'url1' }),
        expect.objectContaining({ url: 'url2' }),
        expect.objectContaining({ url: 'url3' }),
      ])
    )
  })

  it('should insert new images', async () => {
    await repository.insertImages([
      { url: 'url1' },
      { url: 'url2' },
      { url: 'url3' },
    ])

    const newImages = [
      { url: 'url4' },
      { url: 'url5' },
    ]
    const insertedImages = await repository.insertImages(newImages)

    expect(insertedImages).toHaveLength(2)
    expect(insertedImages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: 'url4' }),
        expect.objectContaining({ url: 'url5' }),
      ])
    )

    const allImages = await repository.getImages()
    expect(allImages).toHaveLength(5)
  })

  it('should delete all images', async () => {
    await repository.insertImages([
      { url: 'url1' },
      { url: 'url2' },
    ])

    const result = await repository.deleteImages()
    expect(result).toBeDefined()

    const images = await repository.getImages()
    expect(images).toHaveLength(0)
  })
})