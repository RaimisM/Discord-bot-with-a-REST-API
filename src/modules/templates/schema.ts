import { z } from 'zod'

const idSchema = z.coerce.number().positive('ID must be positive')

const baseRequestSchema = z.object({
  id: idSchema.optional(),
  limit: z.coerce.number().min(1, 'Must be 1 or more').optional(),
})

const templatesSchema = z.object({
  id: idSchema,
  text: z
    .string()
    .trim()
    .min(20, 'Text must be at least 20 characters')
    .max(250, 'Text must be 250 characters or less')
    .refine(
      (text) => text.includes('{username}') && text.includes('{sprint}'),
      'Must include both {username} and {sprint} placeholders'
    ),
})

export { baseRequestSchema, templatesSchema, idSchema }
