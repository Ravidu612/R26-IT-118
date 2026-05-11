import env from '../config/env.js'
import { forwardJson } from '../services/proxyService.js'

const predictionUrl = (path = '') => `${env.modelServiceUrl}/internal/predictions${path}`

export const listPredictions = (req, res, next) =>
  forwardJson({ url: predictionUrl(), req, res, method: 'GET', includeUserContext: true }).catch(next)

export const getPrediction = (req, res, next) =>
  forwardJson({ url: predictionUrl(`/${req.params.id}`), req, res, method: 'GET', includeUserContext: true }).catch(next)

export const deletePrediction = (req, res, next) =>
  forwardJson({ url: predictionUrl(`/${req.params.id}`), req, res, method: 'DELETE', includeUserContext: true }).catch(next)
