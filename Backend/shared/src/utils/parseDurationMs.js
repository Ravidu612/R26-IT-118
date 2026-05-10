const durationPattern = /^(\d+)(ms|s|m|h|d)?$/

const multipliers = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
}

export const parseDurationMs = (value, fallbackMs) => {
  if (!value) return fallbackMs
  const match = String(value).trim().match(durationPattern)
  if (!match) return fallbackMs
  const amount = Number(match[1])
  const unit = match[2] || 'ms'
  return amount * (multipliers[unit] || 1)
}
