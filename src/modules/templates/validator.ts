import { baseRequestSchema, templatesSchema } from './schema'

const parseTemplateId = (data: unknown) =>
  baseRequestSchema.pick({ id: true }).parse(data)

const parseTemplateQuery = (data: unknown) =>
  baseRequestSchema.pick({ id: true, limit: true }).parse(data)

const parseTemplateText = (data: unknown) =>
  templatesSchema.pick({ text: true }).parse(data)

const parseTemplateUpdatable = (data: unknown) =>
  templatesSchema.partial().parse(data)

const templateValidators = () => ({
  parseTemplateId,
  parseTemplateQuery,
  parseTemplateText,
  parseTemplateUpdatable,
})

export default templateValidators
