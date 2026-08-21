import Prediction from '../models/Prediction.js'

export const createPrediction = (payload) => Prediction.create(payload)

export const getPredictions = ({ includeImages = false, moduleType = null } = {}) => {
  const filter = moduleType ? { moduleType } : {}
  const query = Prediction.find(filter).sort({ createdAt: -1 }).limit(includeImages ? 8 : 100)
  return includeImages ? query.select('+imageMeta.base64') : query
}

export const getPredictionById = (id) => Prediction.findById(id)

export const deletePredictionById = (id) => Prediction.findByIdAndDelete(id)
