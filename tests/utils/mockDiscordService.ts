import { DiscordServiceInterface, DiscordUser } from '@/modules/discord/discordService'

class MockDiscordService implements DiscordServiceInterface {
  private users: DiscordUser[] = [
    { id: '1', username: 'TestUser1' },
    { id: '2', username: 'TestUser2' },
  ]

  sendMessage = vi.fn().mockResolvedValue({
    content: 'Mock message sent',
    author: { username: 'TestUser1' },
    createdAt: new Date(),
  } as any)

  getChannelUsers = vi.fn().mockResolvedValue(this.users)

  shutdown = vi.fn().mockResolvedValue(undefined)
}

export default MockDiscordService
