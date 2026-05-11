import { getTaskPolicy } from './taskRiskPolicy.js'

const SAFE_SKILL_ORDER_BY_RISK = {
  High: ['Monitoring', 'Planning', 'Admin', 'Logistics', 'Safety', 'Welfare', 'Inspection', 'Cleaning'],
  Critical: ['Planning', 'Safety', 'Welfare', 'Monitoring', 'Admin', 'Logistics', 'Inspection'],
}

const normalizeText = (value) => String(value || '').trim().toLowerCase()
const getRank = (items, value) => {
  const index = items.map(normalizeText).indexOf(normalizeText(value))
  return index === -1 ? 999 : index
}

const isPreferredSkillSafe = (riskLevel, preferredSkill) => {
  const safeSkills = SAFE_SKILL_ORDER_BY_RISK[riskLevel] || []
  if (!preferredSkill || !safeSkills.length) return Boolean(preferredSkill)
  return safeSkills.map(normalizeText).includes(normalizeText(preferredSkill))
}

const isTaskSkillSafe = (task, riskLevel) => {
  const safeSkills = SAFE_SKILL_ORDER_BY_RISK[riskLevel] || []
  if (!safeSkills.length) return true
  return safeSkills.map(normalizeText).includes(normalizeText(task.requiredSkill))
}

export const isTaskSuitableForRisk = (task, riskLevel) => {
  if (!task) return false
  const policy = getTaskPolicy(riskLevel)
  return policy.difficultyOrder.includes(task.difficulty) && isTaskSkillSafe(task, riskLevel)
}

export const shouldKeepCurrentTask = ({ currentTask, riskLevel, preferredSkill }) => {
  if (!isTaskSuitableForRisk(currentTask, riskLevel)) return false

  const policy = getTaskPolicy(riskLevel)
  if (currentTask.difficulty !== policy.difficultyOrder[0]) return false
  if (!isPreferredSkillSafe(riskLevel, preferredSkill)) return true
  return normalizeText(currentTask.requiredSkill) === normalizeText(preferredSkill)
}

export const pickTask = ({ tasks, riskLevel, preferredSkill, excludeTaskIds = [], difficultyOrder = null }) => {
  const policy = getTaskPolicy(riskLevel)
  const resolvedDifficultyOrder = difficultyOrder || policy.difficultyOrder
  const excludedIds = new Set(excludeTaskIds.filter(Boolean))
  const safeSkills = SAFE_SKILL_ORDER_BY_RISK[riskLevel] || []
  const canUsePreferredSkill = isPreferredSkillSafe(riskLevel, preferredSkill)

  const candidates = tasks.filter((task) =>
    resolvedDifficultyOrder.includes(task.difficulty) &&
    !excludedIds.has(task.taskId) &&
    isTaskSkillSafe(task, riskLevel),
  )
  if (!candidates.length) return null

  return [...candidates].sort((left, right) => {
    const difficultyRank = getRank(resolvedDifficultyOrder, left.difficulty) - getRank(resolvedDifficultyOrder, right.difficulty)
    if (difficultyRank !== 0) return difficultyRank

    const leftPreferred = canUsePreferredSkill && normalizeText(left.requiredSkill) === normalizeText(preferredSkill) ? 0 : 1
    const rightPreferred = canUsePreferredSkill && normalizeText(right.requiredSkill) === normalizeText(preferredSkill) ? 0 : 1
    if (leftPreferred !== rightPreferred) return leftPreferred - rightPreferred

    const skillRank = getRank(safeSkills, left.requiredSkill) - getRank(safeSkills, right.requiredSkill)
    if (skillRank !== 0) return skillRank

    return left.taskId.localeCompare(right.taskId)
  })[0]
}
