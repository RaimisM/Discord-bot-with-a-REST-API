import type { Database } from '@/database'
import type { DiscordServiceInterface } from '@/modules/discord/discordService'
import createUsersRepository from './repository'

export default async function loadUsersData(
  db: Database,
  discordService: DiscordServiceInterface
): Promise<void> {
  const usersRepository = createUsersRepository(db)

  const [dbUsers, discordUsers] = await Promise.all([
    usersRepository.findAll(),
    discordService.getChannelUsers(),
  ])

  const discordUserIds = new Set(discordUsers.map(user => user.id))
  const dbUserIds = new Set(dbUsers.map(user => user.id))

  const usersToDelete = dbUsers.filter(user => !discordUserIds.has(user.id))
  if (usersToDelete.length > 0) {
    await Promise.all(
      usersToDelete.map(user => usersRepository.delete(user.id))
    )
  }

  const usersToAdd = discordUsers.filter(user => !dbUserIds.has(user.id))
  if (usersToAdd.length > 0) {
    await Promise.all(
      usersToAdd.map(user => 
        usersRepository.create({
          id: user.id,
          username: user.username,
        })
      )
    )
  }
}