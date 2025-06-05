import type { Request } from 'express'
import sprintValidators from './validator'
import sprintsRepository from './repository'
import type { Database } from '@/database'
import NotFound from '@/utils/errors/NotFound'
import BadRequest from '@/utils/errors/BadRequest'

export const sprintManager = (db: Database) => {
  const repo = sprintsRepository(db)
  const validator = sprintValidators()

  return {
    getSprints: async (req: Request) => {
      const parsedQuery = validator.parseSprintQuery({
        ...req.query,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        id: req.query.id ? Number(req.query.id) : undefined,
      })

      let sprints = await repo.findAll()

      if (parsedQuery.id !== undefined) {
        sprints = sprints.filter((s) => s.id === parsedQuery.id)
      }

      if (parsedQuery.sprintName !== undefined) {
        sprints = sprints.filter((s) => s.sprintName === parsedQuery.sprintName)
      }

      if (parsedQuery.limit !== undefined) {
        sprints = sprints.slice(0, parsedQuery.limit)
      }

      return sprints
    },

    postSprints: async (req: Request) => {
      const parsed = validator.parseSprint(req.body)

      const existing = await repo.findByName(parsed.sprintName)
      if (existing) {
        throw new BadRequest(`Sprint with name "${parsed.sprintName}" already exists`)
      }

      return repo.create(parsed)
    },

    patchSprints: async (req: Request) => {
      const id = validator.parseSprintId(Number(req.params.id))

      const existing = await repo.findById(id)
      if (!existing) {
        throw new NotFound(`Sprint with id "${id}" not found`)
      }

      const update = validator.parseSprintUpdatable(req.body)

      const updatedSprint = { ...existing, ...update }

      // Optional: validate after merge
      validator.parseSprint(updatedSprint)

      // Delete old and insert new (simulate update)
      await repo.remove(id)
      return repo.create(updatedSprint)
    },

    deleteSprints: async (req: Request) => {
      const id = validator.parseSprintId(Number(req.params.id))

      const existing = await repo.findById(id)
      if (!existing) {
        throw new NotFound(`Sprint with id "${id}" not found`)
      }

      return repo.remove(id)
    },
  }
}