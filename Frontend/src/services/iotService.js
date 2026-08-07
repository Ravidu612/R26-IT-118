import { apiClient } from './apiClient'

export const iotService = {
  async listDevices() {
    const response = await apiClient.get('/iot/devices')
    return response.data
  },
  async getLatestWorkerHealth(deviceId) {
    const response = await apiClient.get(`/iot/worker-health/latest?deviceId=${encodeURIComponent(deviceId)}`)
    return response.data
  },
  async analyzeWorkerHealth(payload) {
    const response = await apiClient.post('/iot/worker-health/analyze', payload)
    return response.data
  },
}
