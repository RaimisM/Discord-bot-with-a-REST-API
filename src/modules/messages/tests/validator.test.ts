import { validPostRequest, validGetRequest } from '../validator'

describe('Validator tests', () => {
  describe('validPostRequest', () => {
    test('should validate a correct post message', () => {
      const validMessage = {
        username: 'Tom',
        sprintCode: 'WD-1-1',
      }

      expect(() => validPostRequest(validMessage)).not.toThrow()
    })

    test('should throw error if username is too short', () => {
      const invalidMessage = {
        username: 'Al',
        sprintCode: 'WD-1-1',
      }

      expect(() => validPostRequest(invalidMessage)).toThrow()
    })

    test('should throw error if sprintCode is missing', () => {
      const invalidMessage = {
        username: 'Tom',
      }

      expect(() => validPostRequest(invalidMessage)).toThrow()
    })

    test('should throw error if input is not an object', () => {
      expect(() => validPostRequest('not an object')).toThrow()
    })
  })

  describe('validGetRequest', () => {
    test('should validate a request with username only', () => {
      const validQuery = {
        username: 'Tom',
      }

      expect(() => validGetRequest(validQuery)).not.toThrow()
    })

    test('should validate a request with sprintCode only', () => {
      const validQuery = {
        sprintCode: 'WD-1-2',
      }

      expect(() => validGetRequest(validQuery)).not.toThrow()
    })

    test('should validate a request with all optional fields', () => {
      const validQuery = {
        username: 'Tom',
        sprintCode: 'WD-1-2',
        limit: 5,
      }

      expect(() => validGetRequest(validQuery)).not.toThrow()
    })

    test('should throw error if username is too short', () => {
      const invalidQuery = {
        username: 'Al',
      }

      expect(() => validGetRequest(invalidQuery)).toThrow()
    })

    test('should throw error if limit is not a number', () => {
      const invalidQuery = {
        limit: 'ten',
      }

      expect(() => validGetRequest(invalidQuery)).toThrow()
    })

    test('should throw error if sprintCode is too short', () => {
      const invalidQuery = {
        sprintCode: 'X',
      }

      expect(() => validGetRequest(invalidQuery)).toThrow()
    })
  })
})
