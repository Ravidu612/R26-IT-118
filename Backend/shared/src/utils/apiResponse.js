export const successResponse = (message, data = {}) => ({
  success: true,
  message,
  data,
})

export const errorResponse = (message, error = null) => ({
  success: false,
  message,
  error,
})
