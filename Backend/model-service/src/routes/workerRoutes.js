import { Router } from 'express'
import { createWorker, getWorker, listWorkers } from '../controllers/workerController.js'

const router = Router()

router.get('/', listWorkers)
router.post('/', createWorker)
router.get('/:id', getWorker)

export default router
