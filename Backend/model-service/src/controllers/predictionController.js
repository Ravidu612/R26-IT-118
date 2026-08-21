import { successResponse } from '../../../shared/src/utils/apiResponse.js'
import AppError from '../utils/AppError.js'
import { predictionHistoryService } from '../services/modelPredictionService.js'

export const listPredictions = async (req, res, next) => {
  try {
    const allowedModules = ['tea_leaf_detection', 'tea_leaf_disease_detection', 'tea_grade_classification', 'worker_health_risk']
    const moduleType = allowedModules.includes(req.query.moduleType) ? req.query.moduleType : null
    const data = await predictionHistoryService.getPredictions({ includeImages: req.query.includeImages === 'true', moduleType })
    res.json(successResponse('Predictions fetched successfully', data))
  } catch (error) {
    next(error)
  }
}

export const getPrediction = async (req, res, next) => {
  try {
    const prediction = await predictionHistoryService.getPredictionById(req.params.id)
    if (!prediction) throw new AppError('Prediction record not found', 404)
    res.json(successResponse('Prediction fetched successfully', prediction))
  } catch (error) {
    next(error)
  }
}

export const deletePrediction = async (req, res, next) => {
  try {
    const deleted = await predictionHistoryService.deletePredictionById(req.params.id)
    if (!deleted) throw new AppError('Prediction record not found', 404)
    res.json(successResponse('Prediction deleted successfully'))
  } catch (error) {
    next(error)
  }
}
