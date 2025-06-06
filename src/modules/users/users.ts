import { Router } from 'express'
import type { Database } from '@/database'
import createdUsersService from './repository'
import { jsonRoute } from '@/utils/middleware'

export default (db: Database) => {
  const router = Router()
  const userService = createdUsersService(db)

  router.route('/').get(jsonRoute(userService.getUsers))

  return router
}
