import { HEALTH_FEATURE_KEYS, HEALTH_STATES } from '../constants/modelConstants.js'

export const KNOWN_RISKS = ['Low', 'Medium', 'High', 'Critical']
export const STATE_BY_RISK = {
  Low: 'relaxed',
  Medium: 'emotional_stress',
  High: 'cognitive_stress',
  Critical: 'physical_stress',
}

export const TASK_POLICY_BY_RISK = {
  Low: { difficultyOrder: ['High', 'Medium', 'Low'], approvalStatus: 'Approved' },
  Medium: { difficultyOrder: ['Medium', 'Low'], approvalStatus: 'Pending Supervisor Review' },
  High: { difficultyOrder: ['Low'], approvalStatus: 'Pending Supervisor Review' },
  Critical: { difficultyOrder: [], approvalStatus: 'Pending Supervisor Review' },
}

export const normalizeRiskLevel = (riskLevel) => {
  const normalized = String(riskLevel || '').trim().toLowerCase()
  if (normalized === 'low') return 'Low'
  if (normalized === 'medium') return 'Medium'
  if (normalized === 'high') return 'High'
  return normalized === 'critical' ? 'Critical' : null
}

export const getTaskPolicy = (riskLevel) => TASK_POLICY_BY_RISK[riskLevel] || TASK_POLICY_BY_RISK.Critical
export const isFiniteNumber = (value) => Number.isFinite(Number(value))
export const hasCompleteModelReadings = (readings) =>
  Boolean(readings) && HEALTH_FEATURE_KEYS.every((key) => isFiniteNumber(readings[key]))

export const deriveRiskLevelFromPrediction = (prediction) => {
  const direct = normalizeRiskLevel(prediction?.risk_level)
  if (direct) return direct

  const score = Number(prediction?.health_score)
  if (Number.isFinite(score)) {
    if (score >= 80) return 'Low'
    if (score >= 60) return 'Medium'
    if (score >= 40) return 'High'
    return 'Critical'
  }

  const state = String(prediction?.predicted_state || '').trim().toLowerCase()
  if (state === 'relaxed') return 'Low'
  if (state === 'emotional_stress') return 'Medium'
  if (state === 'cognitive_stress') return 'High'
  return state === 'physical_stress' ? 'Critical' : null
}

export const deriveRiskLevel = ({ explicitRisk, currentHeartRate, previousHeartRate, spo2 }) => {
  const normalized = normalizeRiskLevel(explicitRisk)
  if (normalized) return normalized

  const hasTrend = Number.isFinite(currentHeartRate) && Number.isFinite(previousHeartRate)
  const trend = hasTrend ? currentHeartRate - previousHeartRate : 0
  if ((Number.isFinite(currentHeartRate) && currentHeartRate >= 120) || (Number.isFinite(spo2) && spo2 < 90) || trend >= 20) return 'Critical'
  if ((Number.isFinite(currentHeartRate) && currentHeartRate >= 108) || (Number.isFinite(spo2) && spo2 < 93) || trend >= 12) return 'High'
  if ((Number.isFinite(currentHeartRate) && currentHeartRate >= 96) || (Number.isFinite(spo2) && spo2 < 95) || trend >= 6) return 'Medium'
  return 'Low'
}

export const getHealthStateForRisk = (riskLevel, modelPrediction) =>
  modelPrediction?.predicted_state || STATE_BY_RISK[riskLevel] || HEALTH_STATES[0]

export const getHeartRateTrend = ({ currentHeartRate, previousHeartRate }) =>
  Number.isFinite(currentHeartRate) && Number.isFinite(previousHeartRate)
    ? Number((currentHeartRate - previousHeartRate).toFixed(2))
    : null

export const getWaitMinutes = ({ riskLevel, currentHeartRate, heartRateTrend, spo2 }) => {
  if (riskLevel === 'Critical') return 30

  const unstable =
    (Number.isFinite(currentHeartRate) && currentHeartRate >= 110) ||
    (Number.isFinite(heartRateTrend) && heartRateTrend >= 10) ||
    (Number.isFinite(spo2) && spo2 < 93)
  if (riskLevel === 'High' && unstable) return 20
  if (riskLevel === 'Medium' && unstable) return 10
  return 0
}
