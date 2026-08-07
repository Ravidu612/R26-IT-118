import { successResponse } from '../../../shared/src/utils/apiResponse.js'
import { analyzeLatestWorkerHealth, getLatestWorkerHealthData, listIotDevices } from '../services/iot/iotService.js'

const getUserId = (req) => req.headers['x-user-id'] || null
const getOptionalText = (value, maxLength = 100) => {
  const text = String(value || '').trim()
  return text ? text.slice(0, maxLength) : null
}

export const listDevices = (_req, res, next) => {
  try {
    res.json(successResponse('IoT devices fetched successfully', listIotDevices()))
  } catch (error) {
    next(error)
  }
}

export const latestWorkerHealth = (req, res, next) => {
  try {
    const data = getLatestWorkerHealthData(req.query.deviceId)
    res.json(successResponse('Latest IoT worker health data fetched successfully', data))
  } catch (error) {
    next(error)
  }
}

export const analyzeWorkerHealth = async (req, res, next) => {
  try {
    const data = await analyzeLatestWorkerHealth({
      deviceId: req.body?.deviceId,
      createdBy: getUserId(req),
      workerName: getOptionalText(req.body?.workerName),
      workerId: getOptionalText(req.body?.workerId),
    })
    res.json(successResponse('Live IoT worker health analysis completed', data))
  } catch (error) {
    next(error)
  }
}
