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

export function createMessageManager(db: any, discordBot: any) {
  const messagesRepository = createMessagesRepository(db)
  const sprintsRepository = createSprintsRepository(db)
  const usersRepository = createUsersRepository(db)

  return {
    async getMessages(req: Request) {
      if (!req || !req.query) {
        throw new BadRequest('Invalid request object')
      }

      const filters = validators.validGetRequest(req.query)
      const messages = await messagesRepository.getMessages(filters)
      return messages
    },

    async createMessage(req: Request) {
      if (!req || !req.body) {
        throw new BadRequest('Invalid request object')
      }

      const body = validators.validPostRequest(req.body)

      const sprint = await sprintsRepository.findByName(body.sprintName)
      if (!sprint) {
        throw new NotFound('Sprint not found')
      }

      const user = await usersRepository.findByUsername(body.username)
      if (!user) {
        throw new BadRequest('User not found')
      }

      let template
      let image

      try {
        template = await getRandomTemplate(db)
      } catch (error) {
        throw new Error('Template service unavailable')
      }

      try {
        image = await getRandomImage(db)
      } catch (error) {
        throw new Error('Image service unavailable')
      }

      const content = await generateMessage({
        template: template.text,
        user,
        sprintName: sprint.sprintName,
      })

      const messageSent = await discordBot.sendMessage({
        content,
        files: [image],
      })

      if (!messageSent) {
        throw new Error('Failed to send the message to Discord')
      }

      const messageToInsert = {
        gifUrl: image,
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
        throw new Error('Database insertion failed')
      }

      await loadUsersData(db, discordBot)

      return {
        message: `Message to the Discord user: ${user.username} was sent at: ${messageSent.createdAt}`,
        insertedMessages,
      }
    },
  }
}
