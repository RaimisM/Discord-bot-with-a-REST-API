import { Router } from 'express'
import type { Database } from '@/database'
import createController from './controller'

const usersManager = (db: Database) => {
  const router = Router()
  const controller = createController(db)

  router.use(controller)

  return router
}

export default usersManager
