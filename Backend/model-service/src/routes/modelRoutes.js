import { Router } from 'express'
import { modelStatus, teaGradeClassify, teaLeafDetect, teaLeafDiseaseDetect, workerHealthRisk } from '../controllers/modelController.js'

const router = Router()

router.post('/tea-leaf-detect', teaLeafDetect)
router.post('/tea-leaf-disease-detect', teaLeafDiseaseDetect)
router.post('/tea-grade-classify', teaGradeClassify)
router.post('/worker-health-risk', workerHealthRisk)
router.get('/status', modelStatus)

export default router
