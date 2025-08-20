import { z } from 'zod'

export const sprintSchema = z.object({
  sprintCode: z
    .string({
      invalid_type_error: 'sprintCode must be a string',
    })
    .min(3, { message: 'Must be 3 or more characters long' })
    .trim(),
  topicName: z
    .string({
      invalid_type_error: 'Topic name must be a string',
    })
    .trim()
    .min(5, { message: 'Must be 5 or more characters long' }),
  id: z
    .number({
      invalid_type_error: 'id must be a number',
    })
    .positive(),
})

export const sprintCreateSchema = sprintSchema.omit({ id: true })

export const sprintUpdateSchema = sprintSchema.omit({ id: true }).partial()

export const querySchema = z.object({
  limit: z
    .number({
      invalid_type_error: 'Limit must be an integer',
    })
    .positive()
    .optional(),
  sprintCode: z
    .string({
      invalid_type_error: 'Sprint code must be a string',
    })
    .trim()
    .optional(),
  id: z
    .number({
      invalid_type_error: 'id must be a number',
    })
    .positive()
    .optional(),
})
