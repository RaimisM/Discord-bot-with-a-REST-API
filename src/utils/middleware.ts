import {
  type Response,
  type Request,
  type NextFunction,
  type RequestHandler,
} from 'express'
import { StatusCodes } from 'http-status-codes'
import MethodNotAllowed from './errors/MethodNotAllowed'

type JsonHandler<T> = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<T | { statusCode: number; body: T }>

/**
 * Wraps a request handler that returns an object. Sends the result as JSON.
 * Handles async errors.
 * Supports returning `{ statusCode, body }` to customize HTTP status codes.
 * @param handler Request handler that returns a serializable object or a wrapped object with statusCode and body.
 * @param defaultStatusCode Default status code if not specified in the result.
 * @returns Request handler that sends the result as JSON.
 */
export function jsonRoute<T>(
  handler: JsonHandler<T>,
  defaultStatusCode = StatusCodes.OK
): RequestHandler {
  return async (req, res, next) => {
    try {
      const result = await handler(req, res, next)

      if (
        typeof result === 'object' &&
        result !== null &&
        'statusCode' in result &&
        'body' in result
      ) {
        const { statusCode, body } = result as {
          statusCode: number
          body: T
        }
        return res.status(statusCode).json(body)
      }

      return res.status(defaultStatusCode).json(result as T)
    } catch (error) {
      return next(error)
    }
  }
}

export function unsupportedRoute(
  req: Request,
  res: Response,
  next: NextFunction
) {
  next(new MethodNotAllowed())
}
