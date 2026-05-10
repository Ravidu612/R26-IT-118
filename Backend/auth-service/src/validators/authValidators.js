import AppError from '../utils/AppError.js'
import { USER_ROLE_SET } from '../../../shared/src/constants/roles.js'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const validateRegisterInput = ({ fullName, email, password, role }) => {
  if (!fullName || fullName.trim().length < 3) throw new AppError('Full Name must be at least 3 characters')
  if (!email || !emailPattern.test(email)) throw new AppError('Enter a valid email address')
  if (!password || password.length < 8) throw new AppError('Password must be at least 8 characters')
  if (!USER_ROLE_SET.has(role)) throw new AppError('Invalid role selected')
}

export const validateLoginInput = ({ email, password }) => {
  if (!email || !emailPattern.test(email)) throw new AppError('Enter a valid email address')
  if (!password || password.length < 8) throw new AppError('Password must be at least 8 characters')
}
