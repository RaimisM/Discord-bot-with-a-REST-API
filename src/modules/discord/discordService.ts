import { Client, GatewayIntentBits, TextChannel, Events, MessagePayload, BaseMessageOptions, Message } from 'discord.js'
import NotFound from '@/utils/errors/NotFound'
import Logger from '@/config/configErrorLogger'

export type DiscordUser = {
    id: string
    username: string
}