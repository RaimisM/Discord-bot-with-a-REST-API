import { baseRequestSchema, templatesSchema, idSchema } from './schema'

const parseTemplateId = (data: unknown) => idSchema.parse(data)

const parseTemplateQuery = (data: unknown) => baseRequestSchema.parse(data)

const parseTemplateText = (data: unknown) =>
  templatesSchema.pick({ text: true }).parse(data)

const parseTemplateUpdatable = (data: unknown) =>
  templatesSchema.partial().omit({ id: true }).strict().parse(data)

const templateValidators = () => ({
  parseTemplateId,
  parseTemplateQuery,
  parseTemplateText,
  parseTemplateUpdatable,
})

export default templateValidators
