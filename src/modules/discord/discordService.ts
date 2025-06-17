import {
  Client,
  GatewayIntentBits,
  TextChannel,
  Events,
  Message,
} from 'discord.js'
import NotFound from '@/utils/errors/NotFound'
import Logger from '@/config/configErrorLogger'

export type DiscordUser = {
  id: string
  username: string
}

export interface DiscordServiceInterface {
  sendMessage(message: string): Promise<Message>
  getChannelUsers(): Promise<DiscordUser[]>
  shutdown(): Promise<void>
}

class DiscordService implements DiscordServiceInterface {
  private client: Client

  private channel?: TextChannel

  private isShutdown = false

  private botReadyPromise: Promise<void>

  constructor(discordToken: string, discordChannel: string) {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    })

    this.botReadyPromise = new Promise((resolve, reject) => {
      this.client.login(discordToken).catch((err) => {
        const errorMessage = `Error when trying to login to Discord: ${err.message}`
        Logger.error(errorMessage)
        reject(new NotFound(errorMessage))
      })

      this.client.once(Events.ClientReady, async () => {
        try {
          const botChannel = await this.client.channels.fetch(discordChannel)
          if (!botChannel?.isTextBased?.()) {
            const errorMessage = 'Channel is not text-based or not found'
            Logger.error(errorMessage)
            reject(new NotFound(errorMessage))
            return
          }

          this.channel = botChannel as TextChannel
          Logger.info(`Discord bot logged in as ${this.client.user?.tag}`)
          Logger.info(`Connected to #${this.channel.name}`)
          Logger.info('Status - READY!')
          resolve()
        } catch (error) {
          const errorMessage = `Failed to load channel: ${String(error)}`
          Logger.error(errorMessage)
          reject(new NotFound(errorMessage))
        }
      })
    })

    process.once('SIGINT', () => {
      this.shutdown()
    })
    process.once('SIGTERM', () => {
      this.shutdown()
    })
  }

  private checkChannel(): void {
    if (!this.channel) {
      throw new NotFound('Channel is not set up correctly.')
    }
  }

  public async sendMessage(message: string): Promise<Message> {
    await this.botReadyPromise
    this.checkChannel()

    if (this.isShutdown) {
      throw new Error('Bot has been shut down.')
    }

    return this.channel!.send(message)
  }

  public async getChannelUsers(): Promise<DiscordUser[]> {
    await this.botReadyPromise
    this.checkChannel()

    if (this.isShutdown) {
      throw new Error('Bot has been shut down.')
    }

    const { guild } = this.channel!
    await guild.members.fetch()

    return guild.members.cache.map((member: any) => ({
      id: member.user.id,
      username: member.user.username,
    }))
  }

  public async shutdown(): Promise<void> {
    if (this.isShutdown) return
    this.isShutdown = true

    Logger.info('Shutting down Discord bot...')
    await this.client.destroy()

    if (process.env.NODE_ENV !== 'test') {
      process.exit(0)
    }
  }
}

export default DiscordService
