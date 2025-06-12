import sprintValidators from '../validator'

const { parseSprintId, parseSprintQuery, parseSprint, parseSprintUpdatable } =
  sprintValidators()

describe('Sprint Validator Tests', () => {
  describe('parseSprintId', () => {
    it('should validate a valid sprint ID number', () => {
      const validId = 1
      expect(() => parseSprintId(validId)).not.toThrow()
    })

    it('should throw if id is missing (undefined)', () => {
      expect(() => parseSprintId(undefined)).toThrow()
    })

    it('should throw if id is not a number', () => {
      const invalidId = 'not-a-number'
      expect(() => parseSprintId(invalidId)).toThrow()
    })

    it('should throw if id is negative', () => {
      expect(() => parseSprintId(-5)).toThrow()
    })

    it('should throw if id is zero', () => {
      expect(() => parseSprintId(0)).toThrow()
    })
  })

  describe('parseSprintQuery', () => {
    it('should validate query with all optional fields', () => {
      const query = { limit: 10, sprintName: 'WD-1-1', id: 1 }
      expect(() => parseSprintQuery(query)).not.toThrow()
    })

    it('should throw if limit is not a number', () => {
      expect(() => parseSprintQuery({ limit: 'ten' })).toThrow()
    })

    it('should throw if id is negative', () => {
      expect(() => parseSprintQuery({ id: -5 })).toThrow()
    })

    it('should throw if sprintName is not a string', () => {
      expect(() => parseSprintQuery({ sprintName: 123 })).toThrow()
    })
  })

  describe('parseSprint', () => {
    const validSprint = {
      id: 1,
      sprintName: 'WD-1-1',
      topicName: 'Authentication',
    }

    it('should validate a complete valid sprint object', () => {
      expect(() => parseSprint(validSprint)).not.toThrow()
    })

    it('should throw if topicName is too short', () => {
      const invalidSprint = { ...validSprint, topicName: 'API' }
      expect(() => parseSprint(invalidSprint)).toThrow()
    })
  })

  describe('parseSprintUpdatable', () => {
    it('should validate a partial update with topicName only', () => {
      const partial = { topicName: 'New Topic Name' }
      expect(() => parseSprintUpdatable(partial)).not.toThrow()
    })

    it('should validate a partial update with sprintName only', () => {
      const partial = { sprintName: 'WD-2-1' }
      expect(() => parseSprintUpdatable(partial)).not.toThrow()
    })

    it('should throw if topicName is invalid', () => {
      const partial = { topicName: '123' }
      expect(() => parseSprintUpdatable(partial)).toThrow()
    })
  })
})
