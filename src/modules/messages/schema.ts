import { z } from 'zod'

const requestSchema = z.object({
  username: z
    .string({
      invalid_type_error: 'Username must be a string',
    })
    .trim()
    .min(3, { message: 'Must be 3 or more characters long' })
    .max(100, { message: 'Must be less then 100 characters long' })
    .optional(),
  sprint: z
    .string({
      invalid_type_error: 'Should be a string',
    })
    .trim()
    .min(3, { message: 'Must be 3 or more characters long' })
    .optional(),
  limit: z
    .number({
      invalid_type_error: 'Limit must be a integer',
    })
    .positive()
    .optional(),
})

const payloadSchema = z.object({
  username: z
    .string({
      invalid_type_error: 'Username must be a string',
    })
    .trim()
    .min(3, { message: 'Must be 3 or more characters long' })
    .max(100, { message: 'Must be less then 100 characters long' }),
  sprintName: z
    .string({
      invalid_type_error: 'sprintName must be a string',
    })
    .trim()
    .min(3, { message: 'Must be 3 or more characters long' }),
})

export { requestSchema, payloadSchema }
