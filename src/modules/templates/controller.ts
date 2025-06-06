import { Router } from 'express'
import { StatusCodes } from 'http-status-codes'
import type { Database } from '@/database'
import { createTemplateManager } from './templates'
import { jsonRoute, unsupportedRoute } from '@/utils/middleware'

export default (db: Database) => {
  const router = Router()
  const templateManager = createTemplateManager(db)

  router
    .route('/')
    .get(jsonRoute(templateManager.getTemplates))
    .post(jsonRoute(templateManager.postTemplates, StatusCodes.CREATED))

  router
    .route('/:id')
    .patch(jsonRoute(templateManager.patchTemplates))
    .delete(jsonRoute(templateManager.deleteTemplates))
    .get(unsupportedRoute)
    .post(unsupportedRoute)
    .patch(unsupportedRoute)

  return router
}