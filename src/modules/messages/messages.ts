import { Request } from 'express'
import createMessagesRepository from './repository'
import createSprintsRepository from '@/modules/sprints/repository'
import createUsersManager from '@/modules/users/users'
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
  const usersManager = createUsersManager()

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

      // Sprint lookup by sprintName, NOT by id
      const sprints = await sprintsRepository.getSprints({
        sprintName: body.sprintName,
      })
      if (!sprints || sprints.length === 0) {
        throw new NotFound('Sprint not found')
      }

      // Pick sprint matching sprintName exactly or fallback to first
      const sprint =
        sprints.find((s: any) => s.sprintName === body.sprintName) || sprints[0]

      const user = usersManager.getUser(body.username)
      if (!user) {
        throw new BadRequest('User not found')
      }

      const template = await getRandomTemplate(db)
      const image = await getRandomImage(db)

      // Generate message content from template text, user and sprintName
      const content = await generateMessage({
        template: template.text,
        user,
        sprintName: sprint.sprintName,
      })

      // Send message to Discord bot
      const messageSent = await discordBot.sendMessage({
        content,
        files: [image], // assuming image is URL string
      })

      if (!messageSent) {
        throw new Error('Failed to send the message to Discord')
      }

      // Construct message object matching your MessagesInsert type
      const messageToInsert = {
        gifUrl: image,
        originalMessage: messageSent.content,
        sprintId: sprint.id,
        sprintName: sprint.sprintName,
        sprintTopic: sprint.topic || '',
        templateId: template.id,
        templateText: template.text,
        username: user.username,
      }

      // Insert expects an array of messages
      const insertedMessages = await messagesRepository.insertMessages([
        messageToInsert,
      ])

      // Reload user data with discordBot
      await loadUsersData(db, discordBot)

      return {
        message: `Message to the Discord user: ${user.username} was sent at: ${messageSent.createdAt}`,
        insertedMessages,
      }
    },
  }
}
