import { successResponse } from '../../../shared/src/utils/apiResponse.js'
import { getRefreshCookieOptions } from '../services/tokenService.js'
import { getCurrentUser, loginUser, logoutUser, refreshUserToken, registerUser } from '../services/authService.js'
import { validateLoginInput, validateRegisterInput } from '../validators/authValidators.js'

const sendAuthResponse = (res, message, payload) => {
  const cookieOptions = getRefreshCookieOptions()
  res.cookie('refreshToken', payload.refreshToken, cookieOptions)
  return res.json(
    successResponse(message, {
      user: payload.user,
      accessToken: payload.accessToken,
    }),
  )
}

export const register = async (req, res, next) => {
  try {
    validateRegisterInput(req.body)
    const payload = await registerUser(req.body)
    return sendAuthResponse(res, 'Registration successful', payload)
  } catch (error) {
    return next(error)
  }
}

export const login = async (req, res, next) => {
  try {
    validateLoginInput(req.body)
    const payload = await loginUser(req.body)
    return sendAuthResponse(res, 'Login successful', payload)
  } catch (error) {
    return next(error)
  }
}

export const logout = async (req, res, next) => {
  try {
    const userId = req.auth?.userId
    await logoutUser(userId)
    res.clearCookie('refreshToken', getRefreshCookieOptions())
    return res.json(successResponse('Logout successful'))
  } catch (error) {
    return next(error)
  }
}

export const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken
    const payload = await refreshUserToken(refreshToken)
    return sendAuthResponse(res, 'Token refreshed successfully', payload)
  } catch (error) {
    return next(error)
  }
}

export const me = async (req, res, next) => {
  try {
    const user = await getCurrentUser(req.auth.userId)
    return res.json(successResponse('Current user fetched successfully', user))
  } catch (error) {
    return next(error)
  }
}
