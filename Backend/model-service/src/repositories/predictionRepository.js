import Prediction from '../models/Prediction.js'

export const createPrediction = (payload) => Prediction.create(payload)

export const getPredictions = () => Prediction.find().sort({ createdAt: -1 }).limit(100)

export const getPredictionById = (id) => Prediction.findById(id)

export const deletePredictionById = (id) => Prediction.findByIdAndDelete(id)
