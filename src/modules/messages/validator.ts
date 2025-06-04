import { requestSchema, payloadSchema } from './schema'

export const validPostRequest = (message: unknown) =>
  payloadSchema.parse(message)
export const validGetRequest = (message: unknown) =>
  requestSchema.parse(message)
