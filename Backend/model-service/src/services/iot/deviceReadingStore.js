import { calculateWorkerHealthFeatures } from './workerHealthFeatureCalculator.js'

const sortReadings = (readings) => readings.sort((left, right) => left.timeMs - right.timeMs)
const sortSamples = (samples) => samples.sort((left, right) => left.timeMs - right.timeMs)
const buildTrend = (readings, key) => readings.slice(-60)
  .map((reading) => ({ timeMs: reading.timeMs, value: reading[key] }))
  .filter((point) => Number.isFinite(Number(point.value)))

export class DeviceReadingStore {
  constructor({ windowMs = 30000, minimumWindowSpanMs = windowMs, minimumReadings = 20, maxReadingsPerDevice = 600, offlineAfterMs = 15000 } = {}) {
    this.windowMs = windowMs
    this.minimumWindowSpanMs = minimumWindowSpanMs
    this.minimumReadings = minimumReadings
    this.maxReadingsPerDevice = maxReadingsPerDevice
    this.offlineAfterMs = offlineAfterMs
    this.devices = new Map()
  }

  ensureDevice(deviceId) {
    if (!this.devices.has(deviceId)) {
      this.devices.set(deviceId, {
        deviceId,
        online: false,
        lastSeen: null,
        readings: [],
        ppgSamples: [],
        motionSamples: [],
        seenKeys: new Set(),
        signalKeys: new Set(),
        seenOrder: [],
        signalOrder: [],
        latestReading: null,
      })
    }
    return this.devices.get(deviceId)
  }

  touch(deviceId, receivedAt = Date.now()) {
    const device = this.ensureDevice(deviceId)
    device.online = true
    device.lastSeen = new Date(receivedAt)
    return device
  }

  updateStatus(deviceId, online, receivedAt = Date.now()) {
    const device = this.ensureDevice(deviceId)
    device.online = online
    device.lastSeen = new Date(receivedAt)
    return device
  }

  resetSessionIfNeeded(device, readings) {
    const latestUptime = device.readings.at(-1)?.uptimeMs
    const incomingUptimes = readings.map((reading) => reading.uptimeMs).filter((value) => value !== null && value !== undefined)
    const highestIncomingUptime = incomingUptimes.length ? Math.max(...incomingUptimes) : null
    if (latestUptime !== null && latestUptime !== undefined && highestIncomingUptime !== null && highestIncomingUptime < latestUptime - this.windowMs) {
      device.readings = []
      device.ppgSamples = []
      device.motionSamples = []
      device.seenKeys.clear()
      device.signalKeys.clear()
      device.seenOrder = []
      device.signalOrder = []
    }
  }

  remember(device, key) {
    if (device.seenKeys.has(key)) return false
    device.seenKeys.add(key)
    device.seenOrder.push(key)
    while (device.seenOrder.length > this.maxReadingsPerDevice * 4) device.seenKeys.delete(device.seenOrder.shift())
    return true
  }

  rememberSignal(device, key) {
    if (device.signalKeys.has(key)) return false
    device.signalKeys.add(key)
    device.signalOrder.push(key)
    while (device.signalOrder.length > this.maxReadingsPerDevice * 60) device.signalKeys.delete(device.signalOrder.shift())
    return true
  }

  trim(device) {
    const latestTime = Math.max(...device.readings.map((reading) => reading.timeMs))
    const startTime = latestTime - this.windowMs
    device.readings = sortReadings(device.readings.filter((reading) => reading.timeMs >= startTime)).slice(-this.maxReadingsPerDevice)
    device.ppgSamples = sortSamples(device.ppgSamples.filter((sample) => sample.timeMs >= startTime)).slice(-this.maxReadingsPerDevice * 50)
    device.motionSamples = sortSamples(device.motionSamples.filter((sample) => sample.timeMs >= startTime)).slice(-this.maxReadingsPerDevice * 50)
    device.latestReading = device.readings.at(-1) || device.latestReading
  }

  ingest(deviceId, readings, signalsOrReceivedAt = {}, receivedAt = Date.now()) {
    const signals = typeof signalsOrReceivedAt === 'number' ? {} : signalsOrReceivedAt || {}
    const ingestTime = typeof signalsOrReceivedAt === 'number' ? signalsOrReceivedAt : receivedAt
    const device = this.touch(deviceId, ingestTime)
    this.resetSessionIfNeeded(device, readings)
    readings.forEach((reading) => {
      const key = reading.sequence === null ? `time:${reading.timeMs}:${reading.bpm}:${reading.spo2}` : `sequence:${reading.sequence}`
      if (this.remember(device, key)) device.readings.push(reading)
    })
    ;(signals.ppg || []).forEach((sample) => {
      const key = `ppg:${sample.timeMs}:${sample.red}:${sample.ir}`
      if (this.rememberSignal(device, key)) device.ppgSamples.push(sample)
    })
    ;(signals.motion || []).forEach((sample) => {
      const key = `motion:${sample.timeMs}:${sample.xMg}:${sample.yMg}:${sample.zMg}`
      if (this.rememberSignal(device, key)) device.motionSamples.push(sample)
    })
    if (device.readings.length) this.trim(device)
    if (!device.readings.length && (device.ppgSamples.length || device.motionSamples.length)) {
      const latestTime = Math.max(...device.ppgSamples.concat(device.motionSamples).map((sample) => sample.timeMs))
      const startTime = latestTime - this.windowMs
      device.ppgSamples = sortSamples(device.ppgSamples.filter((sample) => sample.timeMs >= startTime))
      device.motionSamples = sortSamples(device.motionSamples.filter((sample) => sample.timeMs >= startTime))
    }
    device.lastSeen = new Date(ingestTime)
    return this.getLatest(deviceId, receivedAt)
  }

  getOnline(device, now = Date.now()) {
    return Boolean(device.online && device.lastSeen && now - device.lastSeen.getTime() <= this.offlineAfterMs)
  }

  getWindow(device) {
    const readings = sortReadings([...device.readings])
    const spanMs = readings.length > 1 ? readings.at(-1).timeMs - readings[0].timeMs : 0
    const timeProgress = Math.min(100, Math.round((spanMs / this.windowMs) * 100))
    const countProgress = Math.min(100, Math.round((readings.length / this.minimumReadings) * 100))
    const windowReady = readings.length >= this.minimumReadings && spanMs >= this.minimumWindowSpanMs
    const collectionProgress = windowReady ? 100 : Math.min(99, Math.min(timeProgress, countProgress))
    return { readings, spanMs, windowReady, collectionProgress, features: windowReady ? calculateWorkerHealthFeatures(readings) : null }
  }

  serializeDevice(device, now = Date.now()) {
    const window = this.getWindow(device)
    return {
      deviceId: device.deviceId,
      online: this.getOnline(device, now),
      lastSeen: device.lastSeen?.toISOString() || null,
      latestReading: device.latestReading ? { ...device.latestReading } : null,
      trends: { bpm: buildTrend(window.readings, 'bpm'), liveBpm: buildTrend(window.readings, 'liveBpm') },
      signalSampleCounts: { ppg: device.ppgSamples.length, motion: device.motionSamples.length },
      validReadingCount: window.readings.length,
      collectionProgress: window.collectionProgress,
      windowReady: window.windowReady,
      features: window.features,
    }
  }

  listDevices(now = Date.now()) {
    return [...this.devices.values()].map((device) => this.serializeDevice(device, now))
  }

  getLatest(deviceId, now = Date.now()) {
    const device = this.devices.get(deviceId)
    return device ? this.serializeDevice(device, now) : null
  }

  getAnalysisWindow(deviceId) {
    const device = this.devices.get(deviceId)
    if (!device) return null
    const window = this.getWindow(device)
    const latestTime = window.readings.at(-1)?.timeMs
    const startTime = latestTime === undefined ? null : latestTime - this.windowMs
    const inWindow = (sample) => startTime === null || sample.timeMs >= startTime
    return {
      readings: [...window.readings],
      signals: {
        ppg: device.ppgSamples.filter(inWindow).map((sample) => ({ ...sample })),
        motion: device.motionSamples.filter(inWindow).map((sample) => ({ ...sample })),
      },
    }
  }
}
