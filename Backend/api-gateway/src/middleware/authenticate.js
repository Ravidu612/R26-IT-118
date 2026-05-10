import jwt from 'jsonwebtoken'
import env from '../config/env.js'
import AppError from '../utils/AppError.js'

export const authenticate = (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) throw new AppError('Access token is required', 401)
    const payload = jwt.verify(token, env.accessSecret)
    req.auth = { userId: payload.sub, role: payload.role, email: payload.email }
    next()
  } catch (_error) {
    next(new AppError('Invalid or expired access token', 401))
  }
}
