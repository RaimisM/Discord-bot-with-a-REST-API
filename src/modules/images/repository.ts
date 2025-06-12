import type { Selectable, Insertable, DeleteResult } from 'kysely'
import type { Images, Database } from '@/database'

export type ImagesSelect = Selectable<Images>
export type ImagesInsert = Insertable<Images>

export interface ImagesRepository {
  getImages(): Promise<ImagesSelect[]>
  insertImages(images: ImagesInsert[]): Promise<ImagesSelect[] | undefined>
  deleteImages(): Promise<DeleteResult[]>
}

export default (db: Database): ImagesRepository => ({
  getImages: async () => db.selectFrom('images').selectAll().execute(),

  insertImages: async (images: ImagesInsert[]) =>
    db.insertInto('images').values(images).returningAll().execute(),

  deleteImages: async () => db.deleteFrom('images').execute(),
})
