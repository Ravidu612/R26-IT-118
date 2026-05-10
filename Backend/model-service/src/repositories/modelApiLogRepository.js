import ModelApiLog from '../models/ModelApiLog.js'

export const createModelApiLog = (payload) => ModelApiLog.create(payload)

export const getRecentModelApiLogs = () => ModelApiLog.find().sort({ createdAt: -1 }).limit(30)
