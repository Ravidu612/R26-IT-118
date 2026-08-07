import env from '../config/env.js'
import { forwardJson } from '../services/proxyService.js'

const iotUrl = (path) => `${env.modelServiceUrl}/internal/iot${path}`

export const listDevices = (req, res, next) =>
  forwardJson({ url: iotUrl('/devices'), req, res, method: 'GET', includeUserContext: true }).catch(next)

export const latestWorkerHealth = (req, res, next) => {
  const query = new URLSearchParams({ deviceId: String(req.query.deviceId || '') }).toString()
  forwardJson({ url: iotUrl(`/worker-health/latest?${query}`), req, res, method: 'GET', includeUserContext: true }).catch(next)
}

export const analyzeWorkerHealth = (req, res, next) =>
  forwardJson({ url: iotUrl('/worker-health/analyze'), req, res, body: req.body, includeUserContext: true }).catch(next)
