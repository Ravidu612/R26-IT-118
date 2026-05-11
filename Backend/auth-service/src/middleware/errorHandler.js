import { errorResponse } from '../../../shared/src/utils/apiResponse.js'

export const notFoundHandler = (_req, res) =>
  res.status(404).json(errorResponse('Resource not found', 'Route does not exist'))

export const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500
  const isDev = process.env.NODE_ENV !== 'production'
  const detailedError = isDev ? error.message : 'Internal server error'
  res.status(statusCode).json(errorResponse(error.message || 'Something went wrong', detailedError))
}
