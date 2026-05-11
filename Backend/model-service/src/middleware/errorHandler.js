import { errorResponse } from '../../../shared/src/utils/apiResponse.js'

export const notFoundHandler = (_req, res) =>
  res.status(404).json(errorResponse('Resource not found', 'Route does not exist'))

export const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500
  const detail = process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
  res.status(statusCode).json(errorResponse(error.message || 'Something went wrong', detail))
}
