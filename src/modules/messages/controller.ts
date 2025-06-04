import { Router } from 'express'
import type { Database } from '@/database'
import { messageManager } from './messages'
import { jsonRoute, unsupportedRoute } from '@/utils/middleware'
import { DiscordService } from '../discord/discordService'

export default (db: Database, discordBot: DiscordServiceInterface) => {
  const router = Router()

  const messageService = messageManager(db, discordBot)

  router
    .route('/')
    .get(jsonRoute(messageService.getMessages))
    .post(jsonRoute(messageService.sendMessage))
    .patch(unsupportedRoute)
    .delete(unsupportedRoute)

  return router
}