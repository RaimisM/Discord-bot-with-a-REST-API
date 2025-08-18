import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Events } from 'discord.js'
import DiscordService from '../discordService'
import NotFound from '@/utils/errors/NotFound'

vi.mock('discord.js', async () => {
  const actual =
    await vi.importActual<typeof import('discord.js')>('discord.js')
  return {
    ...actual,
    Client: vi.fn().mockImplementation(() => ({
      login: vi.fn().mockResolvedValue(undefined),
      once: vi.fn((event, callback) => {
        if (event === Events.ClientReady) {
          setTimeout(() => callback(), 0)
        }
      }),
      channels: {
        fetch: vi.fn().mockResolvedValue({
          isTextBased: () => true,
          send: vi.fn().mockImplementation((msg: string) => ({
            content: msg,
            author: { username: 'MockBot' },
            createdAt: new Date(),
          })),
          guild: {
            members: {
              fetch: vi.fn().mockResolvedValue(undefined),
              cache: Object.assign(
                new Map([
                  ['1', { user: { id: '1', username: 'MockUser1' } }],
                  ['2', { user: { id: '2', username: 'MockUser2' } }],
                ]),
                {
                  map: vi.fn().mockReturnValue([
                    { id: '1', username: 'MockUser1' },
                    { id: '2', username: 'MockUser2' },
                  ]),
                }
              ),
            },
          },
          name: 'mock-channel',
        }),
      },
      destroy: vi.fn().mockResolvedValue(undefined),
      user: { tag: 'MockBot#1234' },
    })),
  }
})

describe('DiscordService', () => {
  let service: DiscordService

  beforeEach(() => {
    service = new DiscordService('fake-token', 'fake-channel')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should send a message successfully', async () => {
    const result = await service.sendMessage('Hello Discord!')
    expect(result.content).toBe('Hello Discord!')
    expect(result.author.username).toBe('MockBot')
    expect(result.createdAt).toBeInstanceOf(Date)
  })

  it('should get users from channel', async () => {
    const users = await service.getChannelUsers()
    expect(users).toEqual([
      { id: '1', username: 'MockUser1' },
      { id: '2', username: 'MockUser2' },
    ])
  })

  it('should shutdown without crashing', async () => {
    await expect(service.shutdown()).resolves.toBeUndefined()
  })

  it('should throw when channel is not text-based', async () => {
    const testService = new DiscordService('bad-token', 'bad-channel')
    const mockNonTextChannel = {
      isTextBased: () => false,
    }

    const { client } = testService as any
    client.channels.fetch = vi.fn().mockResolvedValue(mockNonTextChannel)

    await expect(testService.sendMessage('test')).rejects.toThrow()
  })

  it('should throw NotFound when channel is undefined (checkChannel protection)', async () => {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0)
    })
    ;(service as any).channel = undefined

    await expect(service.sendMessage('Should fail')).rejects.toThrow(NotFound)
  })

  it('should throw when sendMessage is called after shutdown', async () => {
    await service.shutdown()
    await expect(service.sendMessage('test after shutdown')).rejects.toThrow(
      'Bot has been shut down.'
    )
  })

  it('should throw when getChannelUsers is called after shutdown', async () => {
    await service.shutdown()
    await expect(service.getChannelUsers()).rejects.toThrow(
      'Bot has been shut down.'
    )
  })

  it('should only contain id and username in mapped users', async () => {
    const users = await service.getChannelUsers()
    users.forEach((u) => {
      expect(Object.keys(u)).toHaveLength(2)
      expect(u).toHaveProperty('id')
      expect(u).toHaveProperty('username')
    })
  })

  it('shutdown should call client.destroy once and not call process.exit in test env', async () => {
    const destroySpy = (service as any).client.destroy as ReturnType<
      typeof vi.fn
    >
    const exitSpy = vi
      .spyOn(process, 'exit')
      // @ts-expect-error – process.exit never returns
      .mockImplementation(() => undefined)

    await service.shutdown()
    await service.shutdown()

    expect(destroySpy).toHaveBeenCalledTimes(1)
    expect(exitSpy).not.toHaveBeenCalled()

    exitSpy.mockRestore()
  })

  it('should handle SIGINT signal by invoking shutdown', async () => {
    const newService = new DiscordService('fake-token', 'fake-channel')
    const destroySpy = (newService as any).client.destroy as ReturnType<
      typeof vi.fn
    >
    process.emit('SIGINT')

    await new Promise<void>((resolve) => {
      setTimeout(resolve, 0)
    })
    expect(destroySpy).toHaveBeenCalledTimes(1)
  })
})
