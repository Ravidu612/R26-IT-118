import { successResponse } from '../../../shared/src/utils/apiResponse.js'
import { runTeaGradeClassification, runTeaLeafDetection, runWorkerHealthPrediction, getModelStatusSummary } from '../services/modelPredictionService.js'
import { runTeaDiseaseDetection } from '../services/teaDiseasePredictionService.js'
import { normalizeHealthPayload, validateHealthPayload, validateImagePayload } from '../validators/modelValidators.js'

const getCreatedBy = (req) => req.headers['x-user-id'] || null

export const teaLeafDetect = async (req, res, next) => {
  try {
    validateImagePayload(req.body)
    const result = await runTeaLeafDetection({
      imageBase64: req.body.imageBase64,
      fileName: req.body.fileName,
      mimeType: req.body.mimeType,
      createdBy: getCreatedBy(req),
    })
    res.json(successResponse('Tea leaf detection completed', result))
  } catch (error) {
    next(error)
  }
}

export const teaGradeClassify = async (req, res, next) => {
  try {
    validateImagePayload(req.body)
    const result = await runTeaGradeClassification({
      imageBase64: req.body.imageBase64,
      fileName: req.body.fileName,
      mimeType: req.body.mimeType,
      createdBy: getCreatedBy(req),
    })
    res.json(successResponse('Tea grade classification completed', result))
  } catch (error) {
    next(error)
  }
}

export const teaLeafDiseaseDetect = async (req, res, next) => {
  try {
    validateImagePayload(req.body)
    const result = await runTeaDiseaseDetection({
      imageBase64: req.body.imageBase64,
      fileName: req.body.fileName,
      mimeType: req.body.mimeType,
      createdBy: getCreatedBy(req),
    })
    res.json(successResponse('Tea leaf disease detection completed', result))
  } catch (error) {
    next(error)
  }
}

export const workerHealthRisk = async (req, res, next) => {
  try {
    validateHealthPayload(req.body)
    const readings = normalizeHealthPayload(req.body)
    const result = await runWorkerHealthPrediction({ readings, createdBy: getCreatedBy(req) })
    res.json(successResponse('Worker health risk prediction completed', result))
  } catch (error) {
    next(error)
  }
}

export const modelStatus = async (_req, res, next) => {
  try {
    const status = await getModelStatusSummary()
    res.json(successResponse('Model status fetched successfully', status))
  } catch (error) {
    next(error)
  }
}
