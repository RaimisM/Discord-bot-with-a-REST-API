import { describe, it, expect } from 'vitest'
import templateValidators from '../validator'

const {
  parseTemplateId,
  parseTemplateQuery,
  parseTemplateText,
  parseTemplateUpdatable,
} = templateValidators()

describe('templateValidators', () => {
  describe('parseTemplateId', () => {
    it('should parse a valid id', () => {
      const result = parseTemplateId(1)
      expect(result).toBe(1)
    })

    it('should throw if id is invalid', () => {
    expect(() => parseTemplateId({ id: 'abc' })).toThrow()
    })
  })

  describe('parseTemplateQuery', () => {
    it('should parse valid id and limit', () => {
      const result = parseTemplateQuery({ id: 2, limit: 5 })
      expect(result).toEqual({ id: 2, limit: 5 })
    })

    it('should throw for invalid or missing fields', () => {
      expect(() => parseTemplateQuery({ limit: 0 })).toThrow()
      expect(() => parseTemplateQuery({ id: 'one' })).toThrow()
    })
  })

  describe('parseTemplateText', () => {
    it('should parse valid text with placeholders', () => {
      const text = 'Hey {username}, your sprint {sprint} is starting!'
      const result = parseTemplateText({ text })
      expect(result).toEqual({ text })
    })

    it('should throw if placeholders are missing or text is too short', () => {
      expect(() => parseTemplateText({ text: 'Hi!' })).toThrow()
      expect(() => parseTemplateText({ text: '{username} only' })).toThrow()
    })
  })

  describe('parseTemplateUpdatable', () => {
    it('should accept partial data', () => {
      const result = parseTemplateUpdatable({})
      expect(result).toEqual({})
    })

    it('should parse a valid partial template', () => {
      const result = parseTemplateUpdatable({
        text: 'Hey {username}, sprint {sprint} just started!',
      })
      expect(result).toEqual({
        text: 'Hey {username}, sprint {sprint} just started!',
      })
    })

    it('should throw for invalid partial data', () => {
      expect(() => parseTemplateUpdatable({ id: 'nope' })).toThrow()
    })
  })
})
