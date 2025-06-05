import { z } from 'zod'
import { sprintSchema, querySchema, sprintUpdateSchema } from './schema'

const idSchema = z.number().positive()

const sprintValidators = () => ({
  parseSprintId: (sprintId: unknown) => idSchema.parse(sprintId),

  parseSprintQuery: (limit: unknown) => querySchema.parse(limit),

  parseSprint: (sprint: unknown) => sprintSchema.parse(sprint),
  parseSprintUpdatable: (sprint: unknown) => sprintUpdateSchema.parse(sprint),
})

export default sprintValidators
