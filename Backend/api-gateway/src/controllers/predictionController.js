import env from '../config/env.js'
import { forwardJson } from '../services/proxyService.js'

const predictionUrl = (path = '') => `${env.modelServiceUrl}/internal/predictions${path}`

export const listPredictions = (req, res, next) => {
  const query = new URLSearchParams()
  if (req.query.includeImages === 'true') query.set('includeImages', 'true')
  if (req.query.moduleType) query.set('moduleType', req.query.moduleType)
  const queryString = query.toString() ? `?${query.toString()}` : ''
  return forwardJson({ url: predictionUrl(queryString), req, res, method: 'GET', includeUserContext: true }).catch(next)
}

export const getPrediction = (req, res, next) =>
  forwardJson({ url: predictionUrl(`/${req.params.id}`), req, res, method: 'GET', includeUserContext: true }).catch(next)

export const deletePrediction = (req, res, next) =>
  forwardJson({ url: predictionUrl(`/${req.params.id}`), req, res, method: 'DELETE', includeUserContext: true }).catch(next)
