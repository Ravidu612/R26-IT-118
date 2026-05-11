import { apiClient } from './apiClient'

const tokenKey = 'tea_guard_access_token'

const saveAccessToken = (accessToken) => {
  if (accessToken) localStorage.setItem(tokenKey, accessToken)
}

const clearAccessToken = () => localStorage.removeItem(tokenKey)

export const authService = {
  async register(payload) {
    const response = await apiClient.post('/auth/register', payload)
    saveAccessToken(response.data.accessToken)
    return response.data
  },
  async login(payload) {
    const response = await apiClient.post('/auth/login', payload)
    saveAccessToken(response.data.accessToken)
    return response.data
  },
  async refresh() {
    const response = await apiClient.post('/auth/refresh', {})
    saveAccessToken(response.data.accessToken)
    return response.data
  },
  async logout() {
    await apiClient.post('/auth/logout', {})
    clearAccessToken()
  },
  async me() {
    const response = await apiClient.get('/auth/me')
    return response.data
  },
  clearAccessToken,
  hasAccessToken: () => Boolean(localStorage.getItem(tokenKey)),
}
