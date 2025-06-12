import { Router } from 'express'
import { StatusCodes } from 'http-status-codes'
import type { Database } from '@/database'
import createUsersRepository from './repository'
import { jsonRoute } from '@/utils/middleware'

export default (db: Database) => {
  const router = Router()
  const repo = createUsersRepository(db)

  router
    .route('/')
    .get(jsonRoute(repo.findAll))
    .post(
      jsonRoute(async (req) => {
        const user = await repo.create(req.body)
        return {
          statusCode: StatusCodes.CREATED,
          body: user,
        }
      })
    )

  router
    .route('/:id')
    .get(jsonRoute(async (req) => repo.findById(req.params.id)))
    .put(jsonRoute(async (req) => repo.update(req.params.id, req.body)))
    .delete(
      jsonRoute(async (req) => {
        await repo.delete(req.params.id)
        return { success: true }
      })
    )

  router.get(
    '/username/:username',
    jsonRoute(async (req) => repo.findByUsername(req.params.username))
  )

  return router
}
