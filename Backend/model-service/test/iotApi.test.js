import assert from 'node:assert/strict'
import test from 'node:test'
import { analyzeWorkerHealth, latestWorkerHealth } from '../src/controllers/iotController.js'
import { analyzeLatestWorkerHealth, deviceReadingStore, getLatestWorkerHealthData } from '../src/services/iot/iotService.js'

const reading = (sequence, timeMs) => ({ sequence, timeMs, uptimeMs: timeMs, bpm: 90, liveBpm: 89.5, spo2: 98, red: 1, ir: 2, fingerDetected: true, signalGood: true, receivedAt: new Date(timeMs).toISOString() })

test('latest IoT data returns collecting state before the window is ready', () => {
  const deviceId = 'api-device-001'
  deviceReadingStore.ingest(deviceId, [reading(1, 0)])
  const latest = getLatestWorkerHealthData(deviceId)
  assert.equal(latest.windowReady, false)
  assert.equal(latest.validReadingCount, 1)
})

test('latest-data API controller returns the standard success envelope', () => {
  let responsePayload
  latestWorkerHealth({ query: { deviceId: 'api-device-001' } }, { json: (payload) => { responsePayload = payload } }, () => {})
  assert.equal(responsePayload.success, true)
  assert.equal(responsePayload.data.deviceId, 'api-device-001')
  assert.equal(responsePayload.data.windowReady, false)
})

test('analyze API controller returns a meaningful insufficient-data error', async () => {
  let receivedError
  await analyzeWorkerHealth({ body: { deviceId: 'api-device-003' }, headers: {} }, { json: () => {} }, (error) => { receivedError = error })
  assert.equal(receivedError.statusCode, 409)
})

test('analyze service sends the completed feature window to the existing prediction flow', async () => {
  const deviceId = 'api-device-002'
  deviceReadingStore.ingest(deviceId, Array.from({ length: 31 }, (_, index) => reading(index + 1, index * 1000)), Date.now())
  let predictionInput
  const result = await analyzeLatestWorkerHealth({
    deviceId,
    createdBy: 'user-1',
    workerName: 'Worker A',
    runPrediction: async (payload) => {
      predictionInput = payload
      return { predicted_state: 'relaxed', risk_level: 'Low' }
    },
  })
  assert.equal(result.windowReady, true)
  assert.equal(result.predicted_state, 'relaxed')
  assert.equal(predictionInput.createdBy, 'user-1')
  assert.equal(predictionInput.source, 'iot')
  assert.equal(predictionInput.deviceId, deviceId)
  assert.equal(predictionInput.readings.avg_hr, 90)
})
