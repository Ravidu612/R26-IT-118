import AppError from '../utils/AppError.js'

const readResponsePayload = async (response) => {
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    return { success: false, message: 'Invalid upstream response', error: await response.text() }
  }
  return response.json()
}

const copySetCookie = (upstreamResponse, res) => {
  if (typeof upstreamResponse.headers.getSetCookie === 'function') {
    const cookies = upstreamResponse.headers.getSetCookie()
    if (cookies.length) res.setHeader('set-cookie', cookies)
    return
  }
  const single = upstreamResponse.headers.get('set-cookie')
  if (single) res.setHeader('set-cookie', single)
}

export const forwardJson = async ({ url, req, res, method = 'POST', body = null, includeUserContext = false }) => {
  try {
    const headers = { 'Content-Type': 'application/json' }
    if (req.headers.authorization) headers.Authorization = req.headers.authorization
    if (req.headers.cookie) headers.Cookie = req.headers.cookie
    if (includeUserContext && req.auth?.userId) headers['x-user-id'] = req.auth.userId
    if (includeUserContext && req.auth?.role) headers['x-user-role'] = req.auth.role

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
    copySetCookie(response, res)
    const payload = await readResponsePayload(response)
    return res.status(response.status).json(payload)
  } catch (_error) {
    throw new AppError('Service unavailable. Unable to contact upstream service.', 503)
  }
}
