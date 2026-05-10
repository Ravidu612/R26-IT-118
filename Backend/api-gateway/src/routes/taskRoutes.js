import { Router } from 'express'
import { assignTask, listTasks, recommendTask } from '../controllers/taskController.js'
import { authenticate } from '../middleware/authenticate.js'

const router = Router()

router.get('/', authenticate, listTasks)
router.post('/recommend', authenticate, recommendTask)
router.post('/assign', authenticate, assignTask)

export default router
