import { Router } from 'express'
import { StatusCodes } from 'http-status-codes'
import type { Database } from '@/database'
import { createTemplate } from './templates'
import { jsonRoute, unsupportedRoute } from '@/utils/middleware'

export default (db: Database) => {
  const router = Router()
  const templateService = createTemplate(db)

  router
    .route('/')
    .get(jsonRoute(templateService.getTemplates))
    .post(jsonRoute(templateService.postTemplates, StatusCodes.CREATED))

  router
    .route('/:id')
    .patch(jsonRoute(templateService.patchTemplates))
    .delete(jsonRoute(templateService.deleteTemplates))
    .get(unsupportedRoute)
    .post(unsupportedRoute)

  return router
}
