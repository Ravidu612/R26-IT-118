import AppError from '../utils/AppError.js'
import { HEALTH_FEATURE_KEYS } from '../constants/modelConstants.js'

const healthFields = HEALTH_FEATURE_KEYS

export const validateImagePayload = (body) => {
  if (!body?.imageBase64) throw new AppError('Image upload is required')
}

export const validateHealthPayload = (body) => {
  healthFields.forEach((field) => {
    const value = body[field]
    if (value === undefined || value === null || Number.isNaN(Number(value))) {
      throw new AppError(`Invalid value for ${field}`)
    }
  })
}

export const normalizeHealthPayload = (body) =>
  healthFields.reduce((acc, field) => ({ ...acc, [field]: Number(body[field]) }), {})
