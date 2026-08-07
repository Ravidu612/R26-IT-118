import { Router } from 'express'
import { modelStatus, teaGradeClassify, teaLeafDetect, teaLeafDiseaseDetect, workerHealthRisk } from '../controllers/modelController.js'
import { authenticate } from '../middleware/authenticate.js'
import upload from '../middleware/upload.js'

const router = Router()

router.post('/tea-leaf-detect', authenticate, upload.single('image'), teaLeafDetect)
router.post('/tea-leaf-disease-detect', authenticate, upload.single('image'), teaLeafDiseaseDetect)
router.post('/tea-grade-classify', authenticate, upload.single('image'), teaGradeClassify)
router.post('/worker-health-risk', authenticate, workerHealthRisk)
router.get('/status', authenticate, modelStatus)

export default router
