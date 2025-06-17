import { Request } from 'express'
import createMessagesRepository from './repository'
import createSprintsRepository from '@/modules/sprints/repository'
import createUsersRepository from '@/modules/users/repository'
import loadUsersData from '@/modules/users/loadUsersData'
import BadRequest from '@/utils/errors/BadRequest'
import NotFound from '@/utils/errors/NotFound'
import * as validators from './validator'
import getRandomTemplate from './utils/getRandomTemplate'
import getRandomImage from './utils/getRandomImage'
import generateMessage from './generator'
import Logger from '@/config/configErrorLogger'

export function createMessageManager(db: any, discordBot: any) {
  const messagesRepository = createMessagesRepository(db)
  const sprintsRepository = createSprintsRepository(db)
  const usersRepository = createUsersRepository(db)

  return {
    async getMessages(req: Request) {
      if (!req?.query) throw new BadRequest('Invalid request object')
      const filters = validators.validGetRequest(req.query)
      return messagesRepository.getMessages(filters)
    },

    async createMessage(req: Request) {
      if (!req?.body) throw new BadRequest('Invalid request object')
      const body = validators.validPostRequest(req.body)

      await loadUsersData(db, discordBot)

      const sprint = await sprintsRepository.findByName(body.sprintName)
      if (!sprint) throw new NotFound('Sprint not found')

      const user = await usersRepository.findByUsername(body.username)
      if (!user) throw new BadRequest('User not found')

      let template
      try {
        template = await getRandomTemplate(db)
      } catch (error) {
        Logger.error(`getRandomTemplate failed: ${(error as Error).message}`)
        throw new Error('Template service unavailable')
      }

      type Image = { url: string } | string

      let imageUrl: string
      try {
        const image = (await getRandomImage(db)) as Image
        imageUrl = typeof image === 'string' ? image : image?.url ?? ''

        if (!imageUrl) throw new Error('Missing image URL')
      } catch (error) {
        Logger.error(`getRandomImage failed: ${(error as Error).message}`)
        throw new Error('Image service unavailable')
      }

      let content
      try {
        content = await generateMessage({
          template: template.text,
          user,
          sprintName: sprint.sprintName,
        })
      } catch (error) {
        Logger.error(`generateMessage failed: ${(error as Error).message}`)
        throw new Error('Message generation failed')
      }

      let messageSent
      try {
        messageSent = await discordBot.sendMessage({
          content,
          files: [imageUrl],
        })

        if (!messageSent) throw new Error()
      } catch {
        Logger.error(`Discord message sending failed`)
        throw new Error('Failed to send the message to Discord')
      }

      const messageToInsert = {
        gifUrl: imageUrl,
        originalMessage: messageSent.content,
        sprintId: sprint.id,
        sprintName: sprint.sprintName,
        sprintTopic: sprint.topicName || '',
        templateId: template.id,
        templateText: template.text,
        username: user.username,
      }

      let insertedMessages
      try {
        insertedMessages = await messagesRepository.insertMessages([
          messageToInsert,
        ])
      } catch (error) {
        Logger.error(`Database insertion failed: ${(error as Error).message}`)
        Logger.error(
          `CRITICAL: Message sent to Discord but not saved: ${JSON.stringify({
            discordMessageId: messageSent.id,
            content: messageSent.content,
            timestamp: messageSent.createdAt,
          })}`
        )
        throw new Error('Database insertion failed')
      }

      return {
        message: `Message to the Discord user: ${user.username} was sent at: ${messageSent.createdAt}`,
        insertedMessages,
      }
    },
  }
}
