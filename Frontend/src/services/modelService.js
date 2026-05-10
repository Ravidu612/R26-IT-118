import { apiClient } from './apiClient'

const toImageFormData = (file) => {
  const formData = new FormData()
  formData.append('image', file)
  return formData
}

export const modelService = {
  async detectTeaLeaf(file) {
    const response = await apiClient.postForm('/models/tea-leaf-detect', toImageFormData(file))
    return response.data
  },
  async classifyTeaGrade(file) {
    const response = await apiClient.postForm('/models/tea-grade-classify', toImageFormData(file))
    return response.data
  },
  async predictWorkerHealthRisk(payload) {
    const response = await apiClient.post('/models/worker-health-risk', payload)
    return response.data
  },
  async getModelStatus() {
    const response = await apiClient.get('/models/status')
    return response.data
  },
}
