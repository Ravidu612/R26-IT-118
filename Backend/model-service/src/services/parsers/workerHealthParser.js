const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
const toNumber = (value) => (Number.isFinite(Number(value)) ? Number(value) : null)
const extractGradioOutputData = (raw) => (Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : Array.isArray(raw?.output?.data) ? raw.output.data : [])

const parseConfidence = (value) => {
  if (typeof value === 'string' && value.includes('%')) {
    const parsed = toNumber(value.replace('%', '').trim())
    return parsed === null ? null : Number(clamp(parsed / 100, 0, 1).toFixed(4))
  }
  const parsed = toNumber(value)
  if (parsed === null) return null
  const normalized = parsed > 1 ? parsed / 100 : parsed
  return Number(clamp(normalized, 0, 1).toFixed(4))
}

const parseProbabilityTable = (tableLike) => {
  const rows = Array.isArray(tableLike?.data) ? tableLike.data : []
  const isPercentage = Array.isArray(tableLike?.headers) && tableLike.headers.some((header) => String(header).includes('%'))
  return rows
    .map((row) => {
      const label = String(row?.[0] ?? '').trim()
      const probability = toNumber(row?.[1])
      if (!label || probability === null) return null
      const normalized = isPercentage ? probability / 100 : probability
      return { label, probability: Number(clamp(normalized, 0, 1).toFixed(4)) }
    })
    .filter(Boolean)
}

const ACTIVITY_RISK = { AEROBIC: 'Low', ANAEROBIC: 'Medium', STRESS: 'High' }
const ACTIVITY_SCORE = { AEROBIC: 80, ANAEROBIC: 55, STRESS: 35 }

const parseActivityResult = (values) => {
  const label = String(values[0] ?? '').trim().toUpperCase()
  if (!label) return null
  const probabilityTable = parseProbabilityTable(values[2])
  const riskLevel = ACTIVITY_RISK[label] || 'Medium'
  return {
    predicted_state: label.toLowerCase(),
    model_state: label,
    confidence: parseConfidence(values[1]) ?? 0.65,
    health_score: ACTIVITY_SCORE[label] || 55,
    risk_level: riskLevel,
    estimated_recovery_time: 'Not estimated by the activity/stress model',
    next_day_recommendation: 'Use this session class with supervisor observations; it is not a medical diagnosis.',
    medical_checkup: 'This model does not provide medical risk diagnoses.',
    probability_table: probabilityTable,
    model_type: 'activity_stress_session',
    model_status: String(values[4] ?? '').trim(),
    predictions: values[3] || null,
  }
}

export const parseWorkerHealthRemoteResult = (raw) => {
  const values = extractGradioOutputData(raw)
  if (values[2]?.data && values.length <= 5) return parseActivityResult(values)
  const [predictedStateRaw, confidenceRaw, healthScoreRaw, riskLevelRaw, recoveryRaw, nextDayRaw, medicalRaw, probabilityRaw] = values
  const predictedState = String(predictedStateRaw ?? '').trim()
  if (!predictedState) return null

  return {
    predicted_state: predictedState.toLowerCase(),
    confidence: parseConfidence(confidenceRaw) ?? 0.65,
    health_score: toNumber(healthScoreRaw) ?? 65,
    risk_level: String(riskLevelRaw ?? '').trim() || 'Medium',
    estimated_recovery_time: String(recoveryRaw ?? '').trim() || '8-16 hours',
    next_day_recommendation: String(nextDayRaw ?? '').trim() || 'Prefer light work shifts and observe worker condition.',
    medical_checkup: String(medicalRaw ?? '').trim() || 'Routine checkup advised',
    probability_table: parseProbabilityTable(probabilityRaw),
  }
}
