import { describe, beforeAll, afterAll, beforeEach, it, expect } from 'vitest'
import createImageRepository from '../repository'
import createTestDatabase from '../../../../tests/utils/createTestDatabase'
import cleanDatabase from '../../../../tests/utils/createTestDatabase/databaseCleaner'
import { createFor, selectAllFor } from '../../../../tests/utils/records'

let db: any
let repository: ReturnType<typeof createImageRepository>
let insertImages: ReturnType<typeof createFor<'images', any>>
let selectImages: ReturnType<typeof selectAllFor<'images', any>>

beforeAll(async () => {
  const testDb = await createTestDatabase()
  db = testDb.db
  repository = createImageRepository(db)
  insertImages = createFor(db, 'images')
  selectImages = selectAllFor(db, 'images')
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
    await insertImages([{ url: 'url1' }, { url: 'url2' }, { url: 'url3' }])

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
    await insertImages([{ url: 'url1' }, { url: 'url2' }, { url: 'url3' }])

    const newImages = [{ url: 'url4' }, { url: 'url5' }]
    const insertedImages = await repository.insertImages(newImages)

    expect(insertedImages).toHaveLength(2)
    expect(insertedImages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: 'url4' }),
        expect.objectContaining({ url: 'url5' }),
      ])
    )

    const allImages = await selectImages()
    expect(allImages).toHaveLength(5)
  })

  it('should delete all images', async () => {
    await insertImages([{ url: 'url1' }, { url: 'url2' }])

    const result = await repository.deleteImages()
    expect(result).toBeDefined()

    const images = await selectImages()
    expect(images).toHaveLength(0)
  })
})
