import { apiClient } from './apiClient'

export const workerService = {
  async listWorkers() {
    const response = await apiClient.get('/workers')
    return response.data
  },
  async createWorker(payload) {
    const response = await apiClient.post('/workers', payload)
    return response.data
  },
  async getWorker(id) {
    const response = await apiClient.get(`/workers/${id}`)
    return response.data
  },
}
