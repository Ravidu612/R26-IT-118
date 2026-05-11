import TaskAssignment from '../models/TaskAssignment.js'

export const createTaskAssignment = (payload) => TaskAssignment.create(payload)

export const listTaskAssignments = () => TaskAssignment.find().sort({ createdAt: -1 }).limit(100)

export const findLatestAssignmentByWorkerName = (workerName) =>
  TaskAssignment.findOne({ workerName }).sort({ createdAt: -1 })
