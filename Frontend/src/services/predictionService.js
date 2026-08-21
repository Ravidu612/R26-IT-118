import { apiClient } from './apiClient'

export const predictionService = {
  async listPredictions({ includeImages = false, moduleType = '' } = {}) {
    const query = new URLSearchParams()
    if (includeImages) query.set('includeImages', 'true')
    if (moduleType) query.set('moduleType', moduleType)
    const queryString = query.toString() ? `?${query.toString()}` : ''
    const response = await apiClient.get(`/predictions${queryString}`)
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
