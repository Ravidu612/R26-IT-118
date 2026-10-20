import TaskAssignment from '../models/TaskAssignment.js'
import Worker from '../models/Worker.js'

const ownerFilter = (createdBy) => (createdBy ? { createdBy } : { createdBy: null })

export const listWorkers = (createdBy) => Worker.find(ownerFilter(createdBy)).sort({ createdAt: -1 })

export const createWorker = (payload) => Worker.create(payload)

export const findWorkerById = (id, createdBy) => Worker.findOne({ _id: id, ...ownerFilter(createdBy) })

export const findLatestAssignmentForWorker = ({ workerId, workerName, assignedBy }) => {
  const workerFilters = []
  if (workerId) workerFilters.push({ workerId })
  if (workerName) workerFilters.push({ workerId: null, workerName })
  const assignmentFilter = assignedBy ? { assignedBy, $or: workerFilters } : { $or: workerFilters }
  return TaskAssignment.findOne(assignmentFilter).sort({ createdAt: -1 })
}
