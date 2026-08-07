import { Router } from 'express'
import { analyzeWorkerHealth, latestWorkerHealth, listDevices } from '../controllers/iotController.js'

const router = Router()

router.get('/devices', listDevices)
router.get('/worker-health/latest', latestWorkerHealth)
router.post('/worker-health/analyze', analyzeWorkerHealth)

export default router
