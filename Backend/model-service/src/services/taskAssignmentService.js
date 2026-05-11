import AppError from '../utils/AppError.js'
import {
  createTaskAssignment,
  findLatestAssignmentByWorkerName,
  listTaskAssignments,
} from '../repositories/taskAssignmentRepository.js'
import { runWorkerHealthPrediction } from './modelPredictionService.js'
import { findTaskById, readTaskCatalog } from './taskCatalogService.js'
import {
  KNOWN_RISKS,
  deriveRiskLevel,
  deriveRiskLevelFromPrediction,
  getHealthStateForRisk,
  getHeartRateTrend,
  getTaskPolicy,
  getWaitMinutes,
  hasCompleteModelReadings,
  isFiniteNumber,
  normalizeRiskLevel,
} from './taskRiskPolicy.js'
import { pickTask, shouldKeepCurrentTask } from './taskSelectionService.js'

const LOW_DIFFICULTY = ['Low']
const APPROVAL_ROLES = new Set(['Admin', 'Tea Factory Manager', 'Field Officer'])

const hasKnownWorkerName = (workerName) => {
  const normalized = String(workerName || '').trim().toLowerCase()
  return Boolean(normalized && normalized !== 'unknown worker')
}

const getLatestTaskId = async (workerName, currentTaskId) => {
  if (currentTaskId || !hasKnownWorkerName(workerName)) return currentTaskId || null
  const latest = await findLatestAssignmentByWorkerName(workerName)
  return latest?.taskId || null
}

const getResolvedVitals = ({ readings, currentHeartRate, previousHeartRate, spo2 }) => {
  const resolvedCurrentHr = currentHeartRate ?? (isFiniteNumber(readings?.avg_hr) ? Number(readings.avg_hr) : null)
  const resolvedPreviousHr = previousHeartRate ?? (
    isFiniteNumber(readings?.avg_hr) && isFiniteNumber(readings?.hr_slope)
      ? Number(readings.avg_hr) - Number(readings.hr_slope)
      : null
  )
  const resolvedSpo2 = spo2 ?? (isFiniteNumber(readings?.min_spo2) ? Number(readings.min_spo2) : null)

  return { currentHeartRate: resolvedCurrentHr, previousHeartRate: resolvedPreviousHr, spo2: resolvedSpo2 }
}

const choosePrimaryTask = ({ tasks, riskLevel, preferredSkill, currentTask, difficultyOrder = null }) => {
  if (shouldKeepCurrentTask({ currentTask, riskLevel, preferredSkill })) return currentTask
  return pickTask({
    tasks,
    riskLevel,
    preferredSkill,
    difficultyOrder,
    excludeTaskIds: [currentTask?.taskId],
  })
}

const buildReassessmentPlan = ({ waitMinutes, fallbackTask }) => ({
  waitMinutes,
  retrySameTaskAfterWait: null,
  switchTaskIfStillRisky: fallbackTask || null,
})

const buildRecommendationMeta = ({ recommendation }) => ({
  reason: recommendation.reason,
  reassessmentPlan: recommendation.reassessmentPlan,
  riskScale: KNOWN_RISKS,
  modelPrediction: recommendation.modelPrediction || null,
  healthState: recommendation.healthState || null,
})

const getApprovalStatus = ({ recommendation, assignedByRole }) => {
  if (!APPROVAL_ROLES.has(assignedByRole || '')) return 'Pending Supervisor Review'
  return recommendation.supervisorApprovalStatus
}

export const recommendTaskDecision = async ({
  workerName,
  riskLevel,
  currentHeartRate,
  previousHeartRate,
  spo2,
  preferredSkill,
  currentTaskId,
  readings,
  createdBy,
}) => {
  const tasks = readTaskCatalog()
  const activeTaskId = await getLatestTaskId(workerName, currentTaskId)
  const currentTask = activeTaskId ? findTaskById(tasks, activeTaskId) : null
  const shouldUseModel = !normalizeRiskLevel(riskLevel) && hasCompleteModelReadings(readings)
  const modelPrediction = shouldUseModel ? await runWorkerHealthPrediction({ readings, createdBy: createdBy || null }) : null
  const vitals = getResolvedVitals({ readings, currentHeartRate, previousHeartRate, spo2 })
  const resolvedRisk = riskLevel || deriveRiskLevelFromPrediction(modelPrediction)
  const normalizedRisk = deriveRiskLevel({ explicitRisk: resolvedRisk, ...vitals })
  const heartRateTrend = getHeartRateTrend(vitals)
  const waitMinutes = getWaitMinutes({ riskLevel: normalizedRisk, ...vitals, heartRateTrend })
  const policy = getTaskPolicy(normalizedRisk)
  const mustReassess = waitMinutes > 0 || !policy.difficultyOrder.length
  const primaryTask = choosePrimaryTask({
    tasks,
    riskLevel: normalizedRisk,
    preferredSkill,
    currentTask,
    difficultyOrder: mustReassess && !policy.difficultyOrder.length ? LOW_DIFFICULTY : null,
  })

  if (!primaryTask && !mustReassess) {
    throw new AppError(`No suitable task available for risk level ${normalizedRisk}`, 422)
  }

  const healthState = getHealthStateForRisk(normalizedRisk, modelPrediction)
  const base = {
    workerName,
    riskLevel: normalizedRisk,
    healthState,
    waitMinutes,
    currentHeartRate: vitals.currentHeartRate,
    previousHeartRate: vitals.previousHeartRate,
    heartRateTrend,
    spo2: vitals.spo2,
    primaryTask,
    modelPrediction,
    supervisorApprovalStatus: policy.approvalStatus,
  }

  if (mustReassess) {
    return {
      ...base,
      action: 'wait_and_reassess',
      reassessmentPlan: buildReassessmentPlan({ waitMinutes, fallbackTask: primaryTask }),
      suggestedTask: primaryTask?.taskName || `Wait ${waitMinutes} minutes and reassess`,
      reason: 'Worker vitals indicate elevated risk. Assign only light duty after supervisor review and reassess.',
    }
  }

  return {
    ...base,
    action: currentTask && primaryTask.taskId !== currentTask.taskId ? 'reassign' : 'assign_now',
    reassessmentPlan: null,
    suggestedTask: primaryTask.taskName,
    reason: `Selected ${primaryTask.difficulty} duty because worker risk is ${normalizedRisk}.`,
  }
}

export const assignTaskDecision = async ({ payload, assignedBy, assignedByRole }) => {
  const recommendation = await recommendTaskDecision({ ...payload, createdBy: assignedBy || null })
  const reassessmentDueAt = recommendation.waitMinutes > 0
    ? new Date(Date.now() + recommendation.waitMinutes * 60 * 1000)
    : null
  const record = {
    workerName: recommendation.workerName,
    riskLevel: recommendation.riskLevel,
    suggestedTask: recommendation.suggestedTask,
    taskId: recommendation.primaryTask?.taskId || null,
    taskName: recommendation.primaryTask?.taskName || null,
    difficulty: recommendation.primaryTask?.difficulty || null,
    requiredSkill: recommendation.primaryTask?.requiredSkill || null,
    action: recommendation.action,
    waitMinutes: recommendation.waitMinutes,
    reassessmentDueAt,
    currentHeartRate: recommendation.currentHeartRate,
    previousHeartRate: recommendation.previousHeartRate,
    heartRateTrend: recommendation.heartRateTrend,
    spo2: recommendation.spo2,
    recommendationMeta: buildRecommendationMeta({ recommendation }),
    approvalStatus: getApprovalStatus({ recommendation, assignedByRole }),
    assignedBy: assignedBy || null,
  }
  const created = await createTaskAssignment(record)
  return { assignment: created, recommendation }
}

export const taskAssignmentService = { listTaskAssignments, recommendTaskDecision, assignTaskDecision }
