import env from '../config/env.js'
import { createModelApiLog, getRecentModelApiLogs } from '../repositories/modelApiLogRepository.js'
import { getSpaceStatus } from './huggingFaceSpaceClient.js'

const safeSpaceStatus = async (moduleType, config) => {
  try {
    return await getSpaceStatus({ ...config, timeoutMs: env.requestTimeoutMs })
  } catch (error) {
    await createModelApiLog({
      moduleType,
      space: config.space || 'unknown',
      requestStatus: 'error',
      latencyMs: 0,
      detail: { reason: error.message },
    })
    return { space: config.space || 'unknown', runtime: 'unknown', error: error.message }
  }
}

export const getModelStatusSummary = async () => {
  const [teaLeaf, teaGrade, workerHealth, recentLogs] = await Promise.all([
    safeSpaceStatus('tea_leaf_detection', env.spaces.teaLeafDetection),
    safeSpaceStatus('tea_grade_classification', env.spaces.teaGrade),
    safeSpaceStatus('worker_health_risk', env.spaces.workerHealth),
    getRecentModelApiLogs(),
  ])
  return { teaLeaf, teaGrade, workerHealth, recentLogs }
}
