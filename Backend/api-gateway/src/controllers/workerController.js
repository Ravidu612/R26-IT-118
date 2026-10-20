import env from '../config/env.js'
import { forwardJson } from '../services/proxyService.js'

const workerUrl = (path = '') => `${env.modelServiceUrl}/internal/workers${path}`

export const listWorkers = (req, res, next) =>
  forwardJson({ url: workerUrl(), req, res, method: 'GET', includeUserContext: true }).catch(next)

export const createWorker = (req, res, next) =>
  forwardJson({ url: workerUrl(), req, res, body: req.body, includeUserContext: true }).catch(next)

export const getWorker = (req, res, next) =>
  forwardJson({ url: workerUrl(`/${req.params.id}`), req, res, method: 'GET', includeUserContext: true }).catch(next)
