import { Router } from 'express'
import { deletePrediction, getPrediction, listPredictions } from '../controllers/predictionController.js'

const router = Router()

router.get('/', listPredictions)
router.get('/:id', getPrediction)
router.delete('/:id', deletePrediction)

export default router
