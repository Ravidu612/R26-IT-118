import env from '../config/env.js'
import { createPrediction } from '../repositories/predictionRepository.js'
import AppError from '../utils/AppError.js'
import { callSpacePrediction } from './huggingFaceSpaceClient.js'

const toDataUrl = (base64, mimeType) => `data:${mimeType || 'image/jpeg'};base64,${base64}`
const extractData = (raw) => (Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [])
const parseConfidence = (value) => {
  const parsed = Number(String(value ?? '').replace('%', '').trim())
  if (!Number.isFinite(parsed)) return 0
  return Number(Math.max(0, Math.min(1, parsed > 1 ? parsed / 100 : parsed)).toFixed(4))
}
const getSeverity = (confidence, detected) => !detected ? 'Low' : confidence >= 0.9 ? 'High' : confidence >= 0.8 ? 'Moderate' : 'Low'

export const parseTeaDiseaseResult = (raw, imageMeta, minConfidence = 0.7) => {
  const [annotatedImage, topClassRaw, confidenceRaw, labelData] = extractData(raw)
  const predictedDisease = String(topClassRaw ?? '').trim()
  if (!predictedDisease) return null
  const confidence = parseConfidence(confidenceRaw)
  const probabilities = Array.isArray(labelData?.confidences)
    ? labelData.confidences
      .map((item) => ({ label: String(item.label ?? ''), probability: Number(Number(item.confidence || 0).toFixed(4)) }))
      .filter((item) => item.label && item.probability > minConfidence)
    : []
  const thresholdPassed = confidence > minConfidence
  if (!thresholdPassed) {
    return {
      detected: false,
      predicted_disease: 'No confident disease detected',
      confidence,
      confidence_threshold: minConfidence,
      threshold_passed: false,
      severity_level: 'Low',
      review_status: 'Reviewed',
      probability_table: [],
      annotatedImageUrl: null,
      recommendation: `No prediction exceeded ${(minConfidence * 100).toFixed(0)}% confidence. Upload a clearer tea leaf image for review.`,
      modelType: 'tea_leaf_disease_yolo',
      imageMeta,
    }
  }
  const healthy = predictedDisease.toLowerCase() === 'healthy'
  const detected = !healthy && predictedDisease.toLowerCase() !== 'no detection'
  return {
    detected,
    predicted_disease: predictedDisease,
    confidence,
    confidence_threshold: minConfidence,
    threshold_passed: true,
    severity_level: getSeverity(confidence, detected),
    review_status: detected ? 'Review required' : 'Reviewed',
    probability_table: probabilities,
    annotatedImageUrl: annotatedImage?.url || null,
    recommendation: healthy ? 'The leaf appears healthy. Continue routine field monitoring.' : 'Disease signs detected. Isolate the sample and request agronomist review.',
    modelType: 'tea_leaf_disease_yolo',
    imageMeta,
  }
}

export const runTeaDiseaseDetection = async ({ imageBase64, fileName, mimeType, createdBy }) => {
  const imageMeta = { fileName, mimeType, base64: imageBase64 }
  const resultImageMeta = { fileName, mimeType }
  if (!env.spaces.teaLeafDisease.space) throw new AppError('Tea leaf disease model space is not configured', 500)
  const imageInput = { url: toDataUrl(imageBase64, mimeType), orig_name: fileName || 'tea-leaf.jpg', mime_type: mimeType || 'image/jpeg', is_stream: false, meta: { _type: 'gradio.FileData' } }
  const remote = await callSpacePrediction({
    space: env.spaces.teaLeafDisease.space,
    token: env.spaces.teaLeafDisease.token,
    apiUrl: env.spaces.teaLeafDisease.apiUrl,
    timeoutMs: env.requestTimeoutMs,
    data: [imageInput],
  })
  const result = parseTeaDiseaseResult(remote.raw, resultImageMeta, env.spaces.teaLeafDisease.minConfidence)
  if (!result) throw new AppError('Tea leaf disease model response format not recognized', 502)
  await createPrediction({ moduleType: 'tea_leaf_disease_detection', imageMeta, result, createdBy })
  return result
}
