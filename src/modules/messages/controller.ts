import { Router, Request } from 'express'
import type { Database } from '@/database'
import { createMessageManager } from './messages'
import { jsonRoute, unsupportedRoute } from '@/utils/middleware'
import type { DiscordServiceInterface } from '../discord/discordService'
import { updateSprintCode } from './utils/getSprintCodeUpdate'

export default (db: Database, discordBot: DiscordServiceInterface) => {
  const router = Router()
  const messageService = createMessageManager(db, discordBot)

  router
    .route('/')
    .get(
      jsonRoute(async (req: Request) => {
        if (req.query.sprintCode && typeof req.query.sprintCode === 'string') {
          req.query.sprintCode = updateSprintCode(req.query.sprintCode)
        }
        return messageService.getMessages(req)
      })
    )
    .post(
      jsonRoute(async (req: Request) => {
        if (req.body.sprintCode && typeof req.body.sprintCode === 'string') {
          req.body.sprintCode = updateSprintCode(req.body.sprintCode)
        }
        return messageService.createMessage(req)
      })
    )
    .patch(unsupportedRoute)
    .delete(unsupportedRoute)

  return router
}
