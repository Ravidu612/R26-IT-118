import bcrypt from 'bcryptjs'
import AppError from '../utils/AppError.js'
import { createUser, findUserByEmail, findUserById, saveRefreshTokenHash } from '../repositories/userRepository.js'
import { createAccessToken, createRefreshToken, verifyRefreshToken } from './tokenService.js'

const sanitizeUser = (user) => ({
  id: user._id.toString(),
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
})

const issueTokens = async (user) => {
  const accessToken = createAccessToken(user)
  const refreshToken = createRefreshToken(user)
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10)
  await saveRefreshTokenHash(user._id, refreshTokenHash)
  return { accessToken, refreshToken }
}

export const registerUser = async ({ fullName, email, password, role }) => {
  const existingUser = await findUserByEmail(email)
  if (existingUser) throw new AppError('Email is already registered', 409)

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await createUser({ fullName, email, passwordHash, role })
  const tokens = await issueTokens(user)

  return { user: sanitizeUser(user), ...tokens }
}

export const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email)
  if (!user) throw new AppError('Invalid email or password', 401)

  const passwordMatch = await bcrypt.compare(password, user.passwordHash)
  if (!passwordMatch) throw new AppError('Invalid email or password', 401)

  const tokens = await issueTokens(user)
  return { user: sanitizeUser(user), ...tokens }
}

export const logoutUser = async (userId) => {
  if (!userId) return
  await saveRefreshTokenHash(userId, null)
}

export const refreshUserToken = async (refreshToken) => {
  if (!refreshToken) throw new AppError('Refresh token is missing', 401)
  const payload = verifyRefreshToken(refreshToken)
  const user = await findUserById(payload.sub)
  if (!user || !user.refreshTokenHash) throw new AppError('Invalid refresh token', 401)

  const tokenMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash)
  if (!tokenMatch) throw new AppError('Refresh token mismatch', 401)

  const tokens = await issueTokens(user)
  return { user: sanitizeUser(user), ...tokens }
}

export const getCurrentUser = async (userId) => {
  const user = await findUserById(userId)
  if (!user) throw new AppError('User not found', 404)
  return sanitizeUser(user)
}
