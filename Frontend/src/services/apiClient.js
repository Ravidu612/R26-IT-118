const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
const tokenKey = 'tea_guard_access_token'
let refreshPromise = null

const getAuthHeaders = () => {
  const token = localStorage.getItem(tokenKey)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const parseResponse = async (response) => {
  const payload = await response.json()
  if (!response.ok || payload.success === false) {
    const errorMessage = payload.message || 'Request failed'
    throw new Error(errorMessage)
  }
  return payload
}

const isRefreshRoute = (path) => path === '/auth/refresh'
const isPublicAuthRoute = (path) => path === '/auth/login' || path === '/auth/register'

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
      .then(parseResponse)
      .then((payload) => {
        const accessToken = payload?.data?.accessToken
        if (!accessToken) throw new Error('Session refresh failed')
        localStorage.setItem(tokenKey, accessToken)
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

const request = async (path, options = {}, retryOnAuth = true) => {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  }
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      ...options,
      headers,
    })
    if (response.status === 401 && retryOnAuth && !isRefreshRoute(path) && !isPublicAuthRoute(path)) {
      try {
        await refreshAccessToken()
      } catch (refreshError) {
        localStorage.removeItem(tokenKey)
        throw new Error('Session expired. Please login again.', { cause: refreshError })
      }
      return request(path, options, false)
    }
    return parseResponse(response)
  } catch (error) {
    const isNetworkError = error instanceof TypeError
    if (isNetworkError) {
      throw new Error('API Gateway unreachable. Start backend services and verify http://localhost:5000/health', { cause: error })
    }
    throw error
  }
}

export const apiClient = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) =>
    request(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  postForm: (path, formData) => request(path, { method: 'POST', body: formData }),
  delete: (path) => request(path, { method: 'DELETE' }),
}
