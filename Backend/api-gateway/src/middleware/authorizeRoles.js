import AppError from '../utils/AppError.js'

export const authorizeRoles =
  (...roles) =>
  (req, _res, next) => {
    if (!req.auth?.role) {
      next(new AppError('Authorization role is missing', 403))
      return
    }
    if (!roles.includes(req.auth.role)) {
      next(new AppError('Insufficient permissions for this action', 403))
      return
    }
    next()
  }
