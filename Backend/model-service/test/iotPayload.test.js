import assert from 'node:assert/strict'
import test from 'node:test'
import { parseVitalsPayload } from '../src/services/iot/mqttPayloadParser.js'

test('parses a batch and filters invalid readings', () => {
  const payload = {
    deviceId: 'device-001',
    readings: [
      { sequence: 1, uptimeMs: 1000, fingerDetected: true, signalGood: true, bpm: 90, spo2: 98 },
      { sequence: 2, uptimeMs: 2000, fingerDetected: false, signalGood: true, bpm: 91, spo2: 98 },
      { sequence: 3, uptimeMs: 3000, fingerDetected: true, signalGood: true, bpm: 250, spo2: 98 },
      { sequence: 4, uptimeMs: 4000, fingerDetected: true, signalGood: true, bpm: 91, spo2: 101 },
    ],
  }
  const parsed = parseVitalsPayload('wearable/device-001/vitals', JSON.stringify(payload), 1700000000000)
  assert.equal(parsed.deviceId, 'device-001')
  assert.equal(parsed.readings.length, 1)
  assert.equal(parsed.readings[0].bpm, 90)
})

test('rejects malformed payloads without throwing', () => {
  assert.equal(parseVitalsPayload('wearable/device-001/vitals', '{invalid-json'), null)
  assert.deepEqual(parseVitalsPayload('wearable/device-001/vitals', JSON.stringify({ readings: [] })), { deviceId: 'device-001', readings: [] })
})

test('parses schema version two PPG and motion batches', () => {
  const payload = {
    schemaVersion: 2,
    deviceId: 'device-002',
    ppgSampleRateHz: 25,
    accSampleRateHz: 25,
    readings: [{ sequence: 1, uptimeMs: 1000, fingerDetected: true, signalGood: true, bpm: 90, spo2: 98, ibiMs: 666 }],
    ppg: { count: 2, startUptimeMs: 1000, red: [10, 11], ir: [20, 21] },
    motion: { count: 2, startUptimeMs: 1000, x: [100, 110], y: [200, 210], z: [1000, 1010] },
  }
  const parsed = parseVitalsPayload('wearable/device-002/vitals', JSON.stringify(payload), 1700000000000)
  assert.equal(parsed.readings[0].ibiMs, 666)
  assert.deepEqual(parsed.signals.ppg.map(({ timeMs, ir }) => ({ timeMs, ir })), [{ timeMs: 1000, ir: 20 }, { timeMs: 1040, ir: 21 }])
  assert.deepEqual(parsed.signals.motion[0], { timeMs: 1000, xMg: 100, yMg: 200, zMg: 1000 })
})
