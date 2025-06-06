import { vi } from 'vitest'
import MockDiscordService from '../../../../tests/utils/mockDiscordService'
import loadUserData from '../loadUsersData'

const mockUsersRepository = {
  findAll: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
  findByUsername: vi.fn(),
}

vi.mock('../repository', () => ({
  default: vi.fn(() => mockUsersRepository),
}))

type Database = any
const db: Database = {}
const discordBot = new MockDiscordService()

beforeEach(() => {
  vi.clearAllMocks()
})

describe('loadUserData', () => {
  test('should remove users not in Discord and add new ones from Discord', async () => {
    const existingUsers = [
      { id: '1', username: 'TestUser1' },
      { id: '3', username: 'OldUser' },
      { id: '4', username: 'AnotherOldUser' },
    ]
    
    mockUsersRepository.findAll.mockResolvedValue(existingUsers)
    
    await loadUserData(db, discordBot)
    
    expect(mockUsersRepository.delete).toHaveBeenCalledWith('3')
    expect(mockUsersRepository.delete).toHaveBeenCalledWith('4')
    expect(mockUsersRepository.delete).toHaveBeenCalledTimes(2)
    
    expect(mockUsersRepository.create).toHaveBeenCalledWith({ id: '2', username: 'TestUser2' })
    expect(mockUsersRepository.create).toHaveBeenCalledTimes(1)
  })

  test('should handle empty database', async () => {
    mockUsersRepository.findAll.mockResolvedValue([])
    
    await loadUserData(db, discordBot)
    
    expect(mockUsersRepository.delete).not.toHaveBeenCalled()
    expect(mockUsersRepository.create).toHaveBeenCalledWith({ id: '1', username: 'TestUser1' })
    expect(mockUsersRepository.create).toHaveBeenCalledWith({ id: '2', username: 'TestUser2' })
    expect(mockUsersRepository.create).toHaveBeenCalledTimes(2)
  })

  test('should handle empty Discord users', async () => {
    const existingUsers = [
      { id: '1', username: 'user1' },
      { id: '2', username: 'user2' },
    ]
    
    mockUsersRepository.findAll.mockResolvedValue(existingUsers)
    discordBot.getChannelUsers.mockResolvedValueOnce([])
    
    await loadUserData(db, discordBot)
    
    expect(mockUsersRepository.delete).toHaveBeenCalledTimes(2)
    expect(mockUsersRepository.create).not.toHaveBeenCalled()
  })

  test('should handle identical user lists', async () => {
    const users = [
      { id: '1', username: 'TestUser1' },
      { id: '2', username: 'TestUser2' },
    ]
    
    mockUsersRepository.findAll.mockResolvedValue(users)
    
    await loadUserData(db, discordBot)
    
    expect(mockUsersRepository.delete).not.toHaveBeenCalled()
    expect(mockUsersRepository.create).not.toHaveBeenCalled()
  })

  test('should handle Discord service errors', async () => {
    mockUsersRepository.findAll.mockResolvedValue([])
    discordBot.getChannelUsers.mockRejectedValueOnce(new Error('Discord API error'))
    
    await expect(loadUserData(db, discordBot)).rejects.toThrow('Discord API error')
  })

  test('should handle database errors', async () => {
    mockUsersRepository.findAll.mockRejectedValue(new Error('Database error'))
    
    await expect(loadUserData(db, discordBot)).rejects.toThrow('Database error')
  })
})