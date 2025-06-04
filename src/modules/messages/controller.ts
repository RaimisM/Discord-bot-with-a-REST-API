import { Router } from 'express'
import type { Database } from '@/database'
import { createMessageManager } from './messages'
import { jsonRoute, unsupportedRoute } from '@/utils/middleware'
import type { DiscordServiceInterface } from '../discord/discordService'

export default (db: Database, discordBot: DiscordServiceInterface) => {
  const router = Router()

  const messageService = createMessageManager(db, discordBot)

  router
    .route('/')
    .get(jsonRoute(messageService.getMessages))
    .post(jsonRoute(messageService.createMessage))
    .patch(unsupportedRoute)
    .delete(unsupportedRoute)

  return router
}
