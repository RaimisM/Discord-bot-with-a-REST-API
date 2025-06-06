import { type ErrorRequestHandler } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ZodError } from 'zod'

const { NODE_ENV } = process.env
const isTest = NODE_ENV === 'test'

function getErrorStatusCode(error: unknown): number {
  if (error instanceof ZodError) return StatusCodes.BAD_REQUEST
  if (typeof error === 'object' && error && 'status' in error && typeof error.status === 'number') {
    return error.status
  }
  return StatusCodes.INTERNAL_SERVER_ERROR
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const jsonErrors: ErrorRequestHandler = (error, _req, res, _next) => {
  const statusCode = getErrorStatusCode(error)

  if (!isTest) {
    // eslint-disable-next-line no-console
    console.error(error)
  }

  if (error instanceof ZodError) {
    return res.status(statusCode).json({
      error: {
        message: 'Validation error',
        errors: error.errors,
      },
    })
  }

  return res.status(statusCode).json({
    error: {
      message:
        typeof error === 'object' && error && 'message' in error && typeof error.message === 'string'
          ? error.message
          : 'Internal server error',
    },
  })
}

export default jsonErrors
