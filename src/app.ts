import express from 'express'
import jsonErrorHandler from './middleware/jsonErrors'
import { type Database } from './database'
import messages from '@/modules/messages/controller'
import templates from '@/modules/templates/controller'
import sprints from '@/modules/sprints/controller'
import users from '@/modules/users/users'
import DiscordService, { DiscordServiceInterface } from '@/modules/discord/discordService'
import { DISCORD_TOKEN_ID, DISCORD_CHANNEL_ID } from './config/config'

export default function createApp(
  db: Database,
  discordBotOverride?: DiscordServiceInterface
) {
  const app = express()

  const discordBot: DiscordServiceInterface =
    discordBotOverride ??
    (() => {
      if (!DISCORD_TOKEN_ID || !DISCORD_CHANNEL_ID) {
        throw new Error('Missing Discord configuration')
      }
      return new DiscordService(DISCORD_TOKEN_ID, DISCORD_CHANNEL_ID)
    })()

  app.use(express.json())

  app.get('/', (req, res) => {
    res.send('🚀 API is running')
  })

  app.use('/messages', messages(db, discordBot))
  app.use('/templates', templates(db))
  app.use('/sprints', sprints(db))
  app.use('/users', users(db))

  app.use(jsonErrorHandler)

  return app
}
