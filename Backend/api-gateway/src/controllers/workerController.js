import { successResponse } from '../../../shared/src/utils/apiResponse.js'
import AppError from '../utils/AppError.js'

const workers = []

export const listWorkers = (_req, res) => {
  res.json(successResponse('Workers fetched successfully', workers))
}

export const createWorker = (req, res, next) => {
  try {
    const { name, role, healthStatus = 'Unknown' } = req.body
    if (!name || !role) throw new AppError('name and role are required')
    const worker = {
      id: String(Date.now()),
      name,
      role,
      healthStatus,
      createdAt: new Date().toISOString(),
    }
    workers.push(worker)
    res.status(201).json(successResponse('Worker created successfully', worker))
  } catch (error) {
    next(error)
  }
}

export const getWorker = (req, res, next) => {
  try {
    const worker = workers.find((item) => item.id === req.params.id)
    if (!worker) throw new AppError('Worker not found', 404)
    res.json(successResponse('Worker fetched successfully', worker))
  } catch (error) {
    next(error)
  }
}
