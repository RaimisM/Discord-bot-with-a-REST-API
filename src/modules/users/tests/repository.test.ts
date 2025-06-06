import createTestDatabase from '@tests/utils/createTestDatabase'
import { createFor } from '@tests/utils/records'
import cleanDatabase from '../../../../tests/utils/createTestDatabase/databaseCleaner'
import createUsersRepository from '../repository'

const testDb = await createTestDatabase()
const { db } = testDb
const usersRepository = createUsersRepository(db)
const createUsers = createFor(db, 'users')

beforeAll(async () => {
  await cleanDatabase(db)
  await createUsers([
    { id: '123', username: 'User1' },
    { id: '456', username: 'User2' },
    { id: '789', username: 'User3' },
  ])
})

describe('Users Repository', () => {
  test('should get all users', async () => {
    const users = await usersRepository.findAll()
    
    expect(users).toHaveLength(3)
    expect(users).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: '123', username: 'User1' }),
        expect.objectContaining({ id: '456', username: 'User2' }),
        expect.objectContaining({ id: '789', username: 'User3' }),
      ])
    )
  })

  test('should find user by username', async () => {
    const user = await usersRepository.findByUsername('User1')
    
    expect(user).toBeDefined()
    expect(user).toEqual(
      expect.objectContaining({
        id: '123',
        username: 'User1',
      })
    )
  })

  test('should find user by id', async () => {
    const user = await usersRepository.findById('456')
    
    expect(user).toBeDefined()
    expect(user).toEqual(
      expect.objectContaining({
        id: '456',
        username: 'User2',
      })
    )
  })

  test('should return undefined if user is not found by username', async () => {
    const user = await usersRepository.findByUsername('NonExistentUser')
    
    expect(user).toBeUndefined()
  })

  test('should return undefined if user is not found by id', async () => {
    const user = await usersRepository.findById('non-existent-id')
    
    expect(user).toBeUndefined()
  })

  test('should add new user', async () => {
    const newUser = {
      id: '999',
      username: 'NewUser',
    }
    
    const createdUser = await usersRepository.create(newUser)
    
    expect(createdUser).toEqual(expect.objectContaining(newUser))
    
    // Verify the user was actually added to the database
    const foundUser = await usersRepository.findById('999')
    expect(foundUser).toEqual(expect.objectContaining(newUser))
  })

  test('should update existing user', async () => {
    const updatedData = {
      username: 'UpdatedUser1',
    }
    
    const updatedUser = await usersRepository.update('123', updatedData)
    
    expect(updatedUser).toEqual(
      expect.objectContaining({
        id: '123',
        username: 'UpdatedUser1',
      })
    )
    
    // Verify the user was actually updated in the database
    const foundUser = await usersRepository.findById('123')
    expect(foundUser?.username).toBe('UpdatedUser1')
  })

  test('should delete user', async () => {
    // First verify the user exists
    const userBeforeDelete = await usersRepository.findById('789')
    expect(userBeforeDelete).toBeDefined()
    
    // Delete the user
    await usersRepository.delete('789')
    
    // Verify the user was deleted
    const userAfterDelete = await usersRepository.findById('789')
    expect(userAfterDelete).toBeUndefined()
  })

  test('should handle duplicate username creation gracefully', async () => {
    const duplicateUser = {
      id: '888',
      username: 'User2', // This username already exists
    }
    
    // This test assumes your repository throws an error or handles duplicates
    // Adjust the expectation based on your actual implementation
    await expect(usersRepository.create(duplicateUser)).rejects.toThrow()
  })

  test('should return empty array when no users exist', async () => {
    // Clean the database completely
    await cleanDatabase(db)
    
    const users = await usersRepository.findAll()
    expect(users).toEqual([])
    
    // Restore test data for other tests
    await createUsers([
      { id: '123', username: 'User1' },
      { id: '456', username: 'User2' },
      { id: '789', username: 'User3' },
    ])
  })
})

afterAll(async () => {
  await cleanDatabase(db)
  await testDb.destroy() // Close database connection
})