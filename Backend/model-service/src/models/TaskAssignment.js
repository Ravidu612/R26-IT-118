import mongoose from 'mongoose'

const taskAssignmentSchema = new mongoose.Schema(
  {
    workerName: { type: String, required: true },
    riskLevel: { type: String, required: true },
    suggestedTask: { type: String, required: true },
    taskId: { type: String, default: null },
    taskName: { type: String, default: null },
    difficulty: { type: String, default: null },
    requiredSkill: { type: String, default: null },
    action: { type: String, default: 'assign_now' },
    waitMinutes: { type: Number, default: 0 },
    reassessmentDueAt: { type: Date, default: null },
    currentHeartRate: { type: Number, default: null },
    previousHeartRate: { type: Number, default: null },
    heartRateTrend: { type: Number, default: null },
    spo2: { type: Number, default: null },
    recommendationMeta: { type: Object, default: null },
    approvalStatus: { type: String, default: 'Pending Supervisor Review' },
    assignedBy: { type: String, default: null },
  },
  { timestamps: true },
)

const TaskAssignment = mongoose.model('TaskAssignment', taskAssignmentSchema)

export default TaskAssignment
