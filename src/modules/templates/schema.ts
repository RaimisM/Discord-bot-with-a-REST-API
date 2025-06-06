import { z } from 'zod'

const baseRequestSchema = z.object({
  id: z
    .number({
      invalid_type_error: 'id must be a number',
    })
    .positive()
    .optional(),
  limit: z
    .number({
      invalid_type_error: 'Limit must be a number',
    })
    .min(1, { message: 'Must be 1 or more' })
    .positive()
    .optional(),
})

const templatesSchema = z.object({
  id: z
    .number({
      invalid_type_error: 'id must be a number',
    })
    .positive(),
  text: z
    .string({
      invalid_type_error: 'Template text must be a string',
    })
    .trim()
    .includes('{username}', { message: 'Must include at least one {username}' })
    .includes('{sprint}', { message: 'Must include at least one {sprint}' })
    .min(20, { message: 'Text should be more than 20 characters long' })
    .max(250, { message: 'Text should be 250 characters long or shorter' }),
})

export { baseRequestSchema, templatesSchema }
