import { GRADE_DESCRIPTIONS, HEALTH_STATES, TEA_GRADE_CLASSES, TEA_LEAF_DETECTION_DEFAULTS } from '../constants/modelConstants.js'
import env from '../config/env.js'
import { createModelApiLog, getRecentModelApiLogs } from '../repositories/modelApiLogRepository.js'
import { createPrediction, deletePredictionById, getPredictionById, getPredictions } from '../repositories/predictionRepository.js'
import { createWorkerHealthRecord } from '../repositories/workerHealthRepository.js'
import AppError from '../utils/AppError.js'
import { callSpacePrediction, getSpaceStatus } from './huggingFaceSpaceClient.js'
import { parseWorkerHealthRemoteResult } from './parsers/workerHealthParser.js'
import { callWorkerHealthModel } from './workerHealthModelClient.js'

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
const raise = (error) => { throw error }
const toDataUrl = (base64, mimeType) => `data:${mimeType || 'image/jpeg'};base64,${base64}`
const toNumber = (value) => (Number.isFinite(Number(value)) ? Number(value) : null)
const findTop = (items, scoreKey) => items.reduce((best, item) => (!best || item[scoreKey] > best[scoreKey] ? item : best), null)
const extractGradioOutputData = (raw) => (Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : Array.isArray(raw?.output?.data) ? raw.output.data : [])

const buildProbabilityTable = (labels, peakIndex, confidence) => {
  const residual = Math.max(0.01, 1 - confidence)
  const spread = residual / Math.max(1, labels.length - 1)
  return labels.map((label, index) => ({ label, probability: Number((index === peakIndex ? confidence : spread).toFixed(4)) }))
}

const runSpaceOrFallback = async ({ moduleType, config, payload, fallbackFactory, parseRemoteResult, allowFallbackOnRemoteError = false, request = callSpacePrediction }) => {
  if (!config.space) return allowFallbackOnRemoteError ? { requestStatus: 'placeholder', result: fallbackFactory('Space is not configured') } : raise(new AppError(`Model space is not configured for ${moduleType}`, 500))
  try {
    const remote = await request({
      space: config.space,
      token: config.token,
      apiUrl: config.apiUrl,
      timeoutMs: env.requestTimeoutMs,
      data: payload,
    })
    await createModelApiLog({ moduleType, space: config.space, requestStatus: 'success', latencyMs: 0, detail: {} })
    const parsedResult = parseRemoteResult ? parseRemoteResult(remote.raw) : null
    if (parsedResult) return { requestStatus: 'success', result: { ...parsedResult, statusMessage: 'Remote response received', rawModelOutput: remote.raw } }
    return allowFallbackOnRemoteError
      ? { requestStatus: 'placeholder', result: { ...fallbackFactory('Fallback used: Remote response format not recognized'), rawModelOutput: remote.raw } }
      : raise(new AppError('Model response format not recognized', 502))
  } catch (error) {
    await createModelApiLog({ moduleType, space: config.space, requestStatus: 'error', latencyMs: 0, detail: { reason: error.message } })
    return allowFallbackOnRemoteError
      ? { requestStatus: 'placeholder', result: fallbackFactory(`Fallback used: ${error.message}`) }
      : raise(new AppError(`Model call failed for ${moduleType}: ${error.message}`, error.statusCode || 502))
  }
}

const parseTeaLeafRemoteResult = (raw, imageMeta) => {
  const [annotatedImage, detectionsTable] = extractGradioOutputData(raw)
  const rows = Array.isArray(detectionsTable?.data) ? detectionsTable.data : []
  const boundingBoxes = rows
    .map((row) => {
      const label = String(row?.[0] ?? '').trim()
      const confidence = toNumber(row?.[1])
      const x1 = toNumber(row?.[2])
      const y1 = toNumber(row?.[3])
      const x2 = toNumber(row?.[4])
      const y2 = toNumber(row?.[5])
      if (!label || label.toLowerCase().includes('no objects') || confidence === null) return null
      if ([x1, y1, x2, y2].some((value) => value === null)) return null
      if (confidence < TEA_LEAF_DETECTION_DEFAULTS.confidenceThreshold) return null
      return { label, confidence: Number(confidence.toFixed(4)), x1, y1, x2, y2, width: Number((x2 - x1).toFixed(2)), height: Number((y2 - y1).toFixed(2)) }
    })
    .filter(Boolean)
  const topDetection = findTop(boundingBoxes, 'confidence')
  return {
    detected: Boolean(topDetection),
    detectedClass: topDetection?.label || null,
    confidence: topDetection?.confidence || 0,
    boundingBoxes,
    annotatedImageUrl: annotatedImage?.url || null,
    thresholdsUsed: {
      confidence: TEA_LEAF_DETECTION_DEFAULTS.confidenceThreshold,
      iou: TEA_LEAF_DETECTION_DEFAULTS.iouThreshold,
    },
    imageMeta,
  }
}

const parseTeaGradeRemoteResult = (raw, imageMeta) => {
  const [gradeOutput] = extractGradioOutputData(raw)
  const predictedGrade = String(gradeOutput?.label || '').trim()
  if (!predictedGrade) return null
  const probability_table = Array.isArray(gradeOutput?.confidences)
    ? gradeOutput.confidences.map((item) => ({ label: item.label, probability: Number(Number(item.confidence || 0).toFixed(4)) }))
    : []
  const topPrediction = findTop(probability_table, 'probability')
  return {
    predicted_grade: predictedGrade,
    confidence: topPrediction?.label === predictedGrade ? topPrediction.probability : Number((topPrediction?.probability || 0.7).toFixed(4)),
    probability_table: probability_table.length ? probability_table : buildProbabilityTable(TEA_GRADE_CLASSES, TEA_GRADE_CLASSES.indexOf(predictedGrade), 0.7),
    grade_description: GRADE_DESCRIPTIONS[predictedGrade] || 'Tea grade identified by the classification model.',
    recommendation: `Maintain sorting controls suitable for ${predictedGrade} before packing.`,
    imageMeta,
  }
}

const detectFallback = (message, imageMeta) => ({
  statusMessage: message,
  detected: true,
  detectedClass: 'tea_leaf',
  confidence: 0.86,
  boundingBoxes: [{ label: 'tea_leaf', confidence: 0.86, x1: 97.4, y1: 120.5, x2: 412.8, y2: 470.9, width: 315.4, height: 350.4 }],
  annotatedImageUrl: null,
  thresholdsUsed: {
    confidence: TEA_LEAF_DETECTION_DEFAULTS.confidenceThreshold,
    iou: TEA_LEAF_DETECTION_DEFAULTS.iouThreshold,
  },
  imageMeta,
})

const classifyFallback = (message, imageMeta) => {
  const pick = imageMeta.fileName ? imageMeta.fileName.length % TEA_GRADE_CLASSES.length : 1
  const predictedGrade = TEA_GRADE_CLASSES[pick]
  const confidence = 0.78
  return {
    statusMessage: message,
    predicted_grade: predictedGrade,
    confidence,
    probability_table: buildProbabilityTable(TEA_GRADE_CLASSES, pick, confidence),
    grade_description: GRADE_DESCRIPTIONS[predictedGrade],
    recommendation: `Maintain sorting controls suitable for ${predictedGrade} before packing.`,
    imageMeta,
  }
}

const healthFallback = (message, readings) => {
  const strain = clamp((readings.avg_hr - 65) * 0.6 + (95 - readings.min_spo2) * 7 + Math.abs(readings.hr_slope) * 4, 0, 100)
  const score = Number((100 - strain).toFixed(2))
  const riskLevel = score >= 75 ? 'Low' : score >= 55 ? 'Medium' : score >= 35 ? 'High' : 'Critical'
  const predicted_state = riskLevel === 'Low' ? 'relaxed' : riskLevel === 'Medium' ? 'emotional_stress' : riskLevel === 'High' ? 'cognitive_stress' : 'physical_stress'
  const recommendationByRisk = { Low: 'Normal work can continue with routine hydration breaks.', Medium: 'Prefer light work shifts and observe worker condition.', High: 'Allow only light work and require supervisor review.', Critical: 'Rest required immediately with medical review.' }
  return {
    statusMessage: message,
    predicted_state,
    confidence: Number(clamp(score / 100, 0.52, 0.96).toFixed(2)),
    health_score: score,
    risk_level: riskLevel,
    estimated_recovery_time: riskLevel === 'Low' ? '4-8 hours' : riskLevel === 'Medium' ? '8-16 hours' : riskLevel === 'High' ? '1-2 days' : 'Immediate rest and assessment',
    next_day_recommendation: recommendationByRisk[riskLevel],
    medical_checkup: riskLevel === 'High' || riskLevel === 'Critical' ? 'Recommended within 24 hours' : 'Routine checkup advised',
    probability_table: buildProbabilityTable(HEALTH_STATES, HEALTH_STATES.indexOf(predicted_state), clamp(score / 100, 0.55, 0.9)),
  }
}

export const runTeaLeafDetection = async ({ imageBase64, fileName, mimeType, createdBy }) => {
  const imageMeta = { fileName, mimeType, base64: imageBase64 }
  const resultImageMeta = { fileName, mimeType }
  const imageInput = { url: toDataUrl(imageBase64, mimeType), orig_name: fileName || 'upload.jpg', mime_type: mimeType || 'image/jpeg', is_stream: false, meta: { _type: 'gradio.FileData' } }
  const response = await runSpaceOrFallback({
    moduleType: 'tea_leaf_detection',
    config: env.spaces.teaLeafDetection,
    payload: [imageInput, TEA_LEAF_DETECTION_DEFAULTS.confidenceThreshold, TEA_LEAF_DETECTION_DEFAULTS.iouThreshold, TEA_LEAF_DETECTION_DEFAULTS.imageSize],
    fallbackFactory: (message) => detectFallback(message, resultImageMeta),
    parseRemoteResult: (raw) => parseTeaLeafRemoteResult(raw, resultImageMeta),
  })
  await createPrediction({ moduleType: 'tea_leaf_detection', imageMeta, result: response.result, createdBy })
  return response.result
}

export const runTeaGradeClassification = async ({ imageBase64, fileName, mimeType, createdBy }) => {
  const imageMeta = { fileName, mimeType, base64: imageBase64 }
  const resultImageMeta = { fileName, mimeType }
  const imageInput = { url: toDataUrl(imageBase64, mimeType), orig_name: fileName || 'upload.jpg', mime_type: mimeType || 'image/jpeg', is_stream: false, meta: { _type: 'gradio.FileData' } }
  const response = await runSpaceOrFallback({
    moduleType: 'tea_grade_classification',
    config: env.spaces.teaGrade,
    payload: [imageInput],
    fallbackFactory: (message) => classifyFallback(message, resultImageMeta),
    parseRemoteResult: (raw) => parseTeaGradeRemoteResult(raw, resultImageMeta),
  })
  await createPrediction({ moduleType: 'tea_grade_classification', imageMeta, result: response.result, createdBy })
  return response.result
}

export const runWorkerHealthPrediction = async ({ readings, signals, createdBy, source = 'manual', deviceId = null, workerName = null, workerId = null }) => {
  const hasRawSignals = Boolean(signals?.ppg?.length && signals?.motion?.length)
  const response = hasRawSignals
    ? await runSpaceOrFallback({
      moduleType: 'worker_health_risk',
      config: env.spaces.workerHealth,
      payload: { readings, signals },
      request: ({ space, token, apiUrl, timeoutMs }) => callWorkerHealthModel({ config: { space, token, apiUrl }, readings, signals, timeoutMs }),
      fallbackFactory: (message) => healthFallback(message, readings),
      parseRemoteResult: parseWorkerHealthRemoteResult,
      allowFallbackOnRemoteError: true,
    })
    : { requestStatus: 'placeholder', result: healthFallback('Raw HR, PPG, and motion samples are required for the fine-tuned HF model.', readings) }
  const metadata = { source, deviceId, workerName, workerId }
  await createWorkerHealthRecord({ readings, predictionResult: response.result, createdBy, ...metadata })
  await createPrediction({ moduleType: 'worker_health_risk', inputPayload: { ...readings, ...metadata }, result: response.result, createdBy, ...metadata })
  return response.result
}

const safeSpaceStatus = async (moduleType, config) => {
  try {
    return await getSpaceStatus({ ...config, timeoutMs: env.requestTimeoutMs })
  } catch (error) {
    await createModelApiLog({ moduleType, space: config.space || 'unknown', requestStatus: 'error', latencyMs: 0, detail: { reason: error.message } })
    return { space: config.space || 'unknown', runtime: 'unknown', error: error.message }
  }
}

export const getModelStatusSummary = async () => {
  const [teaLeaf, teaGrade, workerHealth, recentLogs] = await Promise.all([
    safeSpaceStatus('tea_leaf_detection', env.spaces.teaLeafDetection),
    safeSpaceStatus('tea_grade_classification', env.spaces.teaGrade),
    safeSpaceStatus('worker_health_risk', env.spaces.workerHealth),
    getRecentModelApiLogs(),
  ])
  return { teaLeaf, teaGrade, workerHealth, recentLogs }
}

export const predictionHistoryService = { getPredictions, getPredictionById, deletePredictionById }
