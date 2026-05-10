import { Router } from 'express'
import { deletePrediction, getPrediction, listPredictions } from '../controllers/predictionController.js'
import { authenticate } from '../middleware/authenticate.js'

const router = Router()

router.get('/', authenticate, listPredictions)
router.get('/:id', authenticate, getPrediction)
router.delete('/:id', authenticate, deletePrediction)

export default router
