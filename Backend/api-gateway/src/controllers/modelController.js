import env from '../config/env.js'
import AppError from '../utils/AppError.js'
import { forwardJson } from '../services/proxyService.js'

const modelUrl = (path) => `${env.modelServiceUrl}/internal/models${path}`

const getImagePayload = (req) => {
  if (!req.file) throw new AppError('Image file is required')
  return {
    imageBase64: req.file.buffer.toString('base64'),
    fileName: req.file.originalname,
    mimeType: req.file.mimetype,
  }
}

export const teaLeafDetect = (req, res, next) => {
  const payload = getImagePayload(req)
  forwardJson({
    url: modelUrl('/tea-leaf-detect'),
    req,
    res,
    body: payload,
    includeUserContext: true,
  }).catch(next)
}

export const teaGradeClassify = (req, res, next) => {
  const payload = getImagePayload(req)
  forwardJson({
    url: modelUrl('/tea-grade-classify'),
    req,
    res,
    body: payload,
    includeUserContext: true,
  }).catch(next)
}

export const teaLeafDiseaseDetect = (req, res, next) => {
  const payload = getImagePayload(req)
  forwardJson({
    url: modelUrl('/tea-leaf-disease-detect'),
    req,
    res,
    body: payload,
    includeUserContext: true,
  }).catch(next)
}

export const workerHealthRisk = (req, res, next) => {
  forwardJson({
    url: modelUrl('/worker-health-risk'),
    req,
    res,
    body: req.body,
    includeUserContext: true,
  }).catch(next)
}

export const modelStatus = (req, res, next) =>
  forwardJson({ url: modelUrl('/status'), req, res, method: 'GET', includeUserContext: true }).catch(next)
