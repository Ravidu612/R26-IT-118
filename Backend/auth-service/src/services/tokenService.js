import jwt from 'jsonwebtoken'
import env from '../config/env.js'
import { parseDurationMs } from '../../../shared/src/utils/parseDurationMs.js'

const getPayload = (user) => ({
  sub: user._id.toString(),
  email: user.email,
  role: user.role,
})

export const createAccessToken = (user) =>
  jwt.sign(getPayload(user), env.accessSecret, {
    expiresIn: env.accessExpiresIn,
  })

export const createRefreshToken = (user) =>
  jwt.sign(getPayload(user), env.refreshSecret, {
    expiresIn: env.refreshExpiresIn,
  })

export const verifyAccessToken = (token) => jwt.verify(token, env.accessSecret)

export const verifyRefreshToken = (token) => jwt.verify(token, env.refreshSecret)

export const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
  maxAge: parseDurationMs(env.refreshExpiresIn, 7 * 24 * 60 * 60 * 1000),
  path: '/api/auth',
})
