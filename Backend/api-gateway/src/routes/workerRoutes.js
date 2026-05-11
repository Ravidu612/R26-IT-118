import { Router } from 'express'
import { createWorker, getWorker, listWorkers } from '../controllers/workerController.js'
import { authenticate } from '../middleware/authenticate.js'
import { authorizeRoles } from '../middleware/authorizeRoles.js'

const router = Router()

router.get('/', authenticate, listWorkers)
router.post('/', authenticate, authorizeRoles('Admin', 'Tea Factory Manager'), createWorker)
router.get('/:id', authenticate, getWorker)

export default router
