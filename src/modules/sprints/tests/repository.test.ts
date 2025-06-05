import createTestDatabase from '../../../../tests/utils/createTestDatabase'
import { createFor } from '../../../../tests/utils/records'
import cleanDatabase from '../../../../tests/utils/createTestDatabase/databaseCleaner'
import createRepository from '../repository'
import * as fixtures from '../../../../tests/utils/fixtures'

const testDb = await createTestDatabase()
const createSprint = createFor(db, 'sprints')

beforeAll(async () => {
  await cleanDatabase(db)
  const [sprint] = await createSprint(fixtures.sprints)

  test('should get all sprints'
    should get sprint by sprintName
    should get sprint by id
    should add new sprint
    should delete sprint