import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') })
dotenv.config()

const env = {
  port: Number(process.env.PORT || 5002),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || '',
  requestTimeoutMs: Number(process.env.HF_REQUEST_TIMEOUT_MS || 30000),
  spaces: {
    teaLeafDetection: {
      token: process.env.HF_TEA_LEAF_DETECTION_TOKEN || '',
      space: process.env.HF_TEA_LEAF_DETECTION_SPACE || '',
      apiUrl: process.env.HF_TEA_LEAF_DETECTION_API_URL || '',
    },
    teaGrade: {
      token: process.env.HF_TEA_GRADE_TOKEN || '',
      space: process.env.HF_TEA_GRADE_SPACE || '',
      apiUrl: process.env.HF_TEA_GRADE_API_URL || '',
    },
    workerHealth: {
      token: process.env.HF_WORKER_HEALTH_TOKEN || '',
      space: process.env.HF_WORKER_HEALTH_SPACE || '',
      apiUrl: process.env.HF_WORKER_HEALTH_API_URL || '',
    },
  },
}

export default env
