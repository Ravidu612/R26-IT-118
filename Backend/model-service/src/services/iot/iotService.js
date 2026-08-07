import env from '../../config/env.js'
import AppError from '../../utils/AppError.js'
import { runWorkerHealthPrediction } from '../modelPredictionService.js'
import { DeviceReadingStore } from './deviceReadingStore.js'
import { createMqttConsumer } from './mqttConsumer.js'
import { normalizeDeviceId } from './mqttPayloadParser.js'

export const deviceReadingStore = new DeviceReadingStore(env.mqtt)
const mqttConsumer = createMqttConsumer({ config: env.mqtt, store: deviceReadingStore })

export const startIotIntegration = () => mqttConsumer.start()

export const listIotDevices = () => deviceReadingStore.listDevices()

export const getLatestWorkerHealthData = (deviceId) => {
  const normalizedDeviceId = normalizeDeviceId(deviceId)
  if (!normalizedDeviceId) throw new AppError('A valid deviceId is required', 400)
  return deviceReadingStore.getLatest(normalizedDeviceId) || {
    deviceId: normalizedDeviceId,
    online: false,
    lastSeen: null,
    latestReading: null,
    validReadingCount: 0,
    collectionProgress: 0,
    windowReady: false,
    features: null,
  }
}

export const analyzeLatestWorkerHealth = async ({ deviceId, createdBy, workerName, workerId, runPrediction = runWorkerHealthPrediction }) => {
  const latest = getLatestWorkerHealthData(deviceId)
  if (!latest.windowReady || !latest.features) throw new AppError('Collect at least 20 valid readings across a 30-second window before analysis', 409)
  const analysisWindow = deviceReadingStore.getAnalysisWindow(latest.deviceId)
  const prediction = await runPrediction({
    readings: latest.features,
    signals: analysisWindow?.signals || { ppg: [], motion: [] },
    createdBy,
    source: 'iot',
    deviceId: latest.deviceId,
    workerName,
    workerId,
  })
  return { ...prediction, deviceId: latest.deviceId, workerName: workerName || null, workerId: workerId || null, features: latest.features, windowReady: true }
}
