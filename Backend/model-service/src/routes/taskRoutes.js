import { Router } from 'express'
import { assignTask, listTasks, recommendTask } from '../controllers/taskController.js'

const router = Router()

router.get('/', listTasks)
router.post('/recommend', recommendTask)
router.post('/assign', assignTask)

export default router
