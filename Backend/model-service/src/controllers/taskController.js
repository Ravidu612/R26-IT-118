import { successResponse } from '../../../shared/src/utils/apiResponse.js'
import { taskAssignmentService } from '../services/taskAssignmentService.js'
import { normalizeTaskPayload, validateTaskPayload } from '../validators/taskValidators.js'

export const listTasks = async (_req, res, next) => {
  try {
    const data = await taskAssignmentService.listTaskAssignments()
    res.json(successResponse('Task assignments fetched successfully', data))
  } catch (error) {
    next(error)
  }
}

export const recommendTask = async (req, res, next) => {
  try {
    validateTaskPayload(req.body)
    const recommendation = await taskAssignmentService.recommendTaskDecision({ ...normalizeTaskPayload(req.body), createdBy: req.headers['x-user-id'] || null })
    res.json(successResponse('Task recommendation generated', recommendation))
  } catch (error) {
    next(error)
  }
}

export const assignTask = async (req, res, next) => {
  try {
    validateTaskPayload(req.body)
    const created = await taskAssignmentService.assignTaskDecision({
      payload: normalizeTaskPayload(req.body),
      assignedBy: req.headers['x-user-id'] || null,
      assignedByRole: req.headers['x-user-role'] || null,
    })
    res.json(successResponse('Task assigned successfully', created))
  } catch (error) {
    next(error)
  }
}
