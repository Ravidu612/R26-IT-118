import AppError from '../utils/AppError.js'
import { HEALTH_FEATURE_KEYS } from '../constants/modelConstants.js'

const toNumberOrNull = (value) => {
  if (value === undefined || value === null || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const normalizeHealthReadings = (body) => {
  const source = body.readings && typeof body.readings === 'object' ? body.readings : body
  return HEALTH_FEATURE_KEYS.reduce((acc, key) => ({ ...acc, [key]: toNumberOrNull(source[key]) }), {})
}

export const normalizeTaskPayload = (body) => ({
  workerName: String(body.workerName || 'Unknown Worker').trim(),
  riskLevel: body.risk_level || body.riskLevel || null,
  currentHeartRate: toNumberOrNull(body.currentHeartRate || body.current_heart_rate),
  previousHeartRate: toNumberOrNull(body.previousHeartRate || body.previous_heart_rate),
  spo2: toNumberOrNull(body.spo2 || body.currentSpO2 || body.current_spo2),
  preferredSkill: body.preferredSkill ? String(body.preferredSkill).trim() : null,
  currentTaskId: body.currentTaskId ? String(body.currentTaskId).trim() : null,
  readings: normalizeHealthReadings(body),
})

export const validateTaskPayload = (body) => {
  if (!body || typeof body !== 'object') throw new AppError('Task payload is required', 400)
  const hasRisk = Boolean(body.risk_level || body.riskLevel)
  const hasHr = body.currentHeartRate !== undefined || body.current_heart_rate !== undefined
  const hasSpo2 = body.spo2 !== undefined || body.currentSpO2 !== undefined || body.current_spo2 !== undefined
  const source = body.readings && typeof body.readings === 'object' ? body.readings : body
  const hasCompleteReadings = HEALTH_FEATURE_KEYS.every((key) => toNumberOrNull(source[key]) !== null)
  if (!hasRisk && !hasHr && !hasSpo2 && !hasCompleteReadings) {
    throw new AppError('Provide risk level or current health readings', 400)
  }
}
