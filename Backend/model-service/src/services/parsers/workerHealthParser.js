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
  return rows
    .map((row) => {
      const label = String(row?.[0] ?? '').trim()
      const probability = toNumber(row?.[1])
      if (!label || probability === null) return null
      return { label, probability: Number(clamp(probability, 0, 1).toFixed(4)) }
    })
    .filter(Boolean)
}

export const parseWorkerHealthRemoteResult = (raw) => {
  const [predictedStateRaw, confidenceRaw, healthScoreRaw, riskLevelRaw, recoveryRaw, nextDayRaw, medicalRaw, probabilityRaw] = extractGradioOutputData(raw)
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
