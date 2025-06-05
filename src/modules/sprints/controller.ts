import { Router } from 'express'
import { StatusCodes } from 'http-status-codes'
import type { Database } from '@/database'
import { sprintManager } from './sprints'
import { jsonRoute, unsupportedRoute } from '@/utils/middleware'

export default (db: Database) => {
  const router = Router()
  const sprintService = sprintManager(db)

  router
    .route('/')
    .get(jsonRoute(sprintService.getSprints))
    .post(jsonRoute(sprintService.postSprints, StatusCodes.CREATED))
    .patch(unsupportedRoute)
    .delete(unsupportedRoute)

  router
    .route('/:id')
    .get(unsupportedRoute)
    .post(unsupportedRoute)
    .patch(jsonRoute(sprintService.patchSprints))
    .delete(jsonRoute(sprintService.deleteSprints))

  return router
}
