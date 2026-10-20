import { successResponse } from '../../../shared/src/utils/apiResponse.js'
import { createWorkerProfile, getWorkerProfile, listWorkerProfiles } from '../services/workerService.js'

const normalizeWorker = (body = {}) => ({
  name: String(body.name || '').trim(),
  role: String(body.role || '').trim(),
  healthStatus: String(body.healthStatus || 'Unknown').trim(),
})

const validateWorker = ({ name, role }) => {
  if (!name || !role) {
    const error = new Error('name and role are required')
    error.statusCode = 400
    throw error
  }
}

export const listWorkers = async (req, res, next) => {
  try {
    const workers = await listWorkerProfiles(req.headers['x-user-id'] || null)
    res.json(successResponse('Workers fetched successfully', workers))
  } catch (error) {
    next(error)
  }
}

export const createWorker = async (req, res, next) => {
  try {
    const payload = normalizeWorker(req.body)
    validateWorker(payload)
    const worker = await createWorkerProfile({ ...payload, createdBy: req.headers['x-user-id'] || null })
    res.status(201).json(successResponse('Worker created successfully', worker))
  } catch (error) {
    next(error)
  }
}

export const getWorker = async (req, res, next) => {
  try {
    const worker = await getWorkerProfile(req.params.id, req.headers['x-user-id'] || null)
    res.json(successResponse('Worker fetched successfully', worker))
  } catch (error) {
    next(error)
  }
}
