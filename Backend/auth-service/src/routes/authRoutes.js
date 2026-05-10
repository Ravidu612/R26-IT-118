import { Router } from 'express'
import { login, logout, me, refresh, register } from '../controllers/authController.js'
import { authenticate } from '../middleware/authenticate.js'
import { authRateLimiter } from '../middleware/rateLimiter.js'

const router = Router()

router.post('/register', authRateLimiter, register)
router.post('/login', authRateLimiter, login)
router.post('/refresh', refresh)
router.post('/logout', authenticate, logout)
router.get('/me', authenticate, me)

export default router
