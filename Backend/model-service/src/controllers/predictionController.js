import { successResponse } from '../../../shared/src/utils/apiResponse.js'
import AppError from '../utils/AppError.js'
import { predictionHistoryService } from '../services/modelPredictionService.js'

export const listPredictions = async (_req, res, next) => {
  try {
    const data = await predictionHistoryService.getPredictions()
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
