import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') })
dotenv.config()

const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
  modelServiceUrl: process.env.MODEL_SERVICE_URL || 'http://localhost:5002',
  accessSecret: process.env.JWT_ACCESS_SECRET || '',
}

export default env
