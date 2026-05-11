import { apiClient } from './apiClient'

export const predictionService = {
  async listPredictions() {
    const response = await apiClient.get('/predictions')
    return response.data
  },
  async getPrediction(id) {
    const response = await apiClient.get(`/predictions/${id}`)
    return response.data
  },
  async deletePrediction(id) {
    const response = await apiClient.delete(`/predictions/${id}`)
    return response.data
  },
}
