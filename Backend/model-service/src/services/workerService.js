import AppError from '../utils/AppError.js'
import {
  createWorker,
  findLatestAssignmentForWorker,
  findWorkerById,
  listWorkers,
} from '../repositories/workerRepository.js'

const assignmentLabel = (assignment) => assignment?.taskName || assignment?.suggestedTask || null

const toWorkerView = async (worker, createdBy) => {
  const assignment = await findLatestAssignmentForWorker({
    workerId: String(worker._id),
    workerName: worker.name,
    assignedBy: createdBy || null,
  })
  const data = worker.toObject()
  return {
    ...data,
    id: String(worker._id),
    assignedTask: assignmentLabel(assignment),
    assignmentId: assignment?._id ? String(assignment._id) : null,
    assignmentStatus: assignment?.approvalStatus || null,
  }
}

export const listWorkerProfiles = async (createdBy) => {
  const workers = await listWorkers(createdBy)
  return Promise.all(workers.map((worker) => toWorkerView(worker, createdBy)))
}

export const createWorkerProfile = async ({ name, role, healthStatus, createdBy }) => {
  const worker = await createWorker({ name, role, healthStatus, createdBy })
  return toWorkerView(worker, createdBy)
}

export const getWorkerProfile = async (id, createdBy) => {
  const worker = await findWorkerById(id, createdBy)
  if (!worker) throw new AppError('Worker not found', 404)
  return toWorkerView(worker, createdBy)
}
