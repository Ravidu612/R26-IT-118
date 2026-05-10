import WorkerHealthRecord from '../models/WorkerHealthRecord.js'

export const createWorkerHealthRecord = (payload) => WorkerHealthRecord.create(payload)
