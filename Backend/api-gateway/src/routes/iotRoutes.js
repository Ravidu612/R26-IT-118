import { Router } from 'express'
import { analyzeWorkerHealth, latestWorkerHealth, listDevices } from '../controllers/iotController.js'
import { authenticate } from '../middleware/authenticate.js'

const router = Router()

router.get('/devices', authenticate, listDevices)
router.get('/worker-health/latest', authenticate, latestWorkerHealth)
router.post('/worker-health/analyze', authenticate, analyzeWorkerHealth)

export default router
