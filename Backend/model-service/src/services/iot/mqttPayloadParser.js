const DEVICE_ID_PATTERN = /^[A-Za-z0-9._-]{1,100}$/

const toFiniteNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const normalizeSeries = (values, count, startUptimeMs, sampleRate, mapValue) => {
  if (!Array.isArray(values) || !Number.isFinite(sampleRate) || sampleRate <= 0) return []
  return values.slice(0, count).map((value, index) => {
    const mapped = mapValue(value, index)
    return mapped ? { ...mapped, timeMs: startUptimeMs + (index * 1000) / sampleRate } : null
  }).filter(Boolean)
}

export const normalizeDeviceId = (value) => {
  const deviceId = String(value || '').trim()
  return DEVICE_ID_PATTERN.test(deviceId) ? deviceId : null
}

const getTopicDeviceId = (topic, suffix) => {
  const parts = String(topic || '').split('/')
  return parts.length >= 3 && parts[0] === 'wearable' && parts[2] === suffix ? normalizeDeviceId(parts[1]) : null
}

export const getDeviceIdFromTopic = (topic) => getTopicDeviceId(topic, 'vitals') || getTopicDeviceId(topic, 'status')

export const normalizeVitalReading = (raw, receivedAt) => {
  if (!raw || raw.fingerDetected !== true || raw.signalGood !== true) return null
  const bpm = toFiniteNumber(raw.bpm)
  const spo2 = toFiniteNumber(raw.spo2)
  if (bpm === null || bpm < 30 || bpm > 220 || spo2 === null || spo2 < 70 || spo2 > 100) return null

  const sequence = toFiniteNumber(raw.sequence)
  const uptimeMs = toFiniteNumber(raw.uptimeMs)
  const receivedTime = Number(receivedAt)
  const timeMs = uptimeMs === null ? receivedTime : uptimeMs

  return {
    sequence,
    uptimeMs,
    timeMs,
    bpm,
    liveBpm: toFiniteNumber(raw.liveBpm),
    spo2,
    ibiMs: toFiniteNumber(raw.ibiMs),
    red: toFiniteNumber(raw.red),
    ir: toFiniteNumber(raw.ir),
    fingerDetected: true,
    signalGood: true,
    receivedAt: new Date(receivedTime).toISOString(),
  }
}

const parsePpgSamples = (payload) => {
  const ppg = payload?.ppg
  const sampleRate = toFiniteNumber(payload?.ppgSampleRateHz)
  if (!ppg || !sampleRate) return []
  const red = Array.isArray(ppg.red) ? ppg.red : []
  const ir = Array.isArray(ppg.ir) ? ppg.ir : []
  const count = Math.min(toFiniteNumber(ppg.count) || red.length, red.length, ir.length)
  return normalizeSeries(red, count, toFiniteNumber(ppg.startUptimeMs) || 0, sampleRate, (value, index) => {
    const redValue = toFiniteNumber(value)
    const irValue = toFiniteNumber(ir[index])
    return redValue === null || irValue === null ? null : { red: redValue, ir: irValue }
  })
}

const parseMotionSamples = (payload) => {
  const motion = payload?.motion
  const sampleRate = toFiniteNumber(payload?.accSampleRateHz)
  if (!motion || !sampleRate) return []
  const x = Array.isArray(motion.x) ? motion.x : []
  const y = Array.isArray(motion.y) ? motion.y : []
  const z = Array.isArray(motion.z) ? motion.z : []
  const count = Math.min(toFiniteNumber(motion.count) || x.length, x.length, y.length, z.length)
  return normalizeSeries(x, count, toFiniteNumber(motion.startUptimeMs) || 0, sampleRate, (value, index) => {
    const values = [value, y[index], z[index]].map(toFiniteNumber)
    return values.some((item) => item === null) ? null : { xMg: values[0], yMg: values[1], zMg: values[2] }
  })
}

const parseJson = (message) => {
  try {
    return JSON.parse(Buffer.from(message).toString('utf8'))
  } catch (_error) {
    return null
  }
}

export const parseVitalsPayload = (topic, message, receivedAt = Date.now()) => {
  const payload = parseJson(message)
  if (!payload || !Array.isArray(payload.readings)) return null
  const deviceId = normalizeDeviceId(payload.deviceId) || getTopicDeviceId(topic, 'vitals')
  if (!deviceId) return null
  const parsed = {
    deviceId,
    readings: payload.readings.map((reading) => normalizeVitalReading(reading, receivedAt)).filter(Boolean),
  }
  const ppg = parsePpgSamples(payload)
  const motion = parseMotionSamples(payload)
  if (ppg.length || motion.length) parsed.signals = { ppg, motion }
  return parsed
}

export const parseStatusPayload = (topic, message) => {
  const payload = parseJson(message)
  const deviceId = normalizeDeviceId(payload?.deviceId) || getTopicDeviceId(topic, 'status')
  if (!deviceId || typeof payload?.online !== 'boolean') return null
  return { deviceId, online: payload.online }
}
