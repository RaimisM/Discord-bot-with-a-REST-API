import { userMention } from 'discord.js'
import { UsersSelect } from '@/modules/users/repository'

export interface GenerateMessageOptions {
  template: string
  user: UsersSelect
  sprintTopic: string
}

export default async function generateMessage(
  options: GenerateMessageOptions
): Promise<string> {
  const mentionUser = userMention(options.user.id)

  const formedMessage = generateTemplate(options.template, {
    username: mentionUser,
    topic: options.sprintTopic,
  })

  return formedMessage
}

function generateTemplate(
  template: string,
  replacements: { [key: string]: string }
): string {
  return template.replace(/{(.*?)}/g, (_, key) =>
    key in replacements ? replacements[key] : `{${key}}`
  )
}
