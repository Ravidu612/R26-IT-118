import { apiClient } from './apiClient'

export const taskService = {
  async listTasks() {
    const response = await apiClient.get('/tasks')
    return response.data
  },
  async recommendTask(payload) {
    const response = await apiClient.post('/tasks/recommend', payload)
    return response.data
  },
  async assignTask(payload) {
    const response = await apiClient.post('/tasks/assign', payload)
    return response.data
  },
}
