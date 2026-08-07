import assert from 'node:assert/strict'
import test from 'node:test'
import { DeviceReadingStore } from '../src/services/iot/deviceReadingStore.js'

const reading = (sequence, timeMs, bpm = 90, spo2 = 98) => ({ sequence, timeMs, uptimeMs: timeMs, bpm, liveBpm: bpm, spo2, red: 1, ir: 2, fingerDetected: true, signalGood: true, receivedAt: new Date(timeMs).toISOString() })

test('ignores duplicate sequence numbers and retains an ordered rolling window', () => {
  const store = new DeviceReadingStore({ windowMs: 30000, minimumReadings: 3, maxReadingsPerDevice: 10, offlineAfterMs: 1000 })
  store.ingest('device-001', [reading(3, 3000), reading(1, 1000), reading(2, 2000)])
  store.ingest('device-001', [reading(2, 2000), reading(4, 4000)])
  const latest = store.getLatest('device-001', 1000)
  assert.equal(latest.validReadingCount, 4)
  assert.equal(latest.latestReading.sequence, 4)
  assert.equal(latest.online, true)
})

test('reports a ready 30-second window and an offline device', () => {
  const store = new DeviceReadingStore({ windowMs: 30000, minimumReadings: 20, offlineAfterMs: 1000 })
  const readings = Array.from({ length: 31 }, (_, index) => reading(index + 1, index * 1000))
  store.ingest('device-002', readings, 5000)
  const ready = store.getLatest('device-002', 5000)
  assert.equal(ready.windowReady, true)
  assert.equal(ready.collectionProgress, 100)
  assert.equal(ready.validReadingCount, 31)
  assert.equal(ready.trends.bpm.length, 31)
  assert.equal(ready.trends.liveBpm.length, 31)
  assert.equal(store.getLatest('device-002', 7000).online, false)
})

test('accepts an approximately 30-second sample span without falsely showing 100% early', () => {
  const store = new DeviceReadingStore({ windowMs: 30000, minimumWindowSpanMs: 28500, minimumReadings: 20 })
  const readings = Array.from({ length: 30 }, (_, index) => reading(index + 1, index * 1000))
  store.ingest('device-003', readings, 5000)
  const latest = store.getLatest('device-003', 5000)
  assert.equal(latest.windowReady, true)
  assert.equal(latest.collectionProgress, 100)
})

test('retains raw PPG and motion samples for the HF model window', () => {
  const store = new DeviceReadingStore({ windowMs: 30000, minimumReadings: 3 })
  const readings = Array.from({ length: 31 }, (_, index) => reading(index + 1, index * 1000))
  const signals = {
    ppg: Array.from({ length: 31 }, (_, index) => ({ timeMs: index * 1000, red: 1, ir: 2 })),
    motion: Array.from({ length: 31 }, (_, index) => ({ timeMs: index * 1000, xMg: 0, yMg: 0, zMg: 1000 })),
  }
  store.ingest('device-004', readings, signals, 5000)
  const window = store.getAnalysisWindow('device-004')
  assert.equal(window.signals.ppg.length, 31)
  assert.equal(window.signals.motion.length, 31)
})
