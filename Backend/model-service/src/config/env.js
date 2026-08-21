import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const iotWindowMs = Number(process.env.IOT_WINDOW_MS || 30000)
const iotMinimumWindowSpanMs = Number(process.env.IOT_MIN_WINDOW_SPAN_MS || Math.floor(iotWindowMs * 0.95))

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') })
dotenv.config()

const env = {
  port: Number(process.env.PORT || 5002),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || '',
  mongoServerSelectionTimeoutMs: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 5000),
  dnsServers: (process.env.DNS_SERVERS || '').split(',').map((server) => server.trim()).filter(Boolean),
  requestTimeoutMs: Number(process.env.HF_REQUEST_TIMEOUT_MS || 30000),
  mqtt: {
    enabled: process.env.MQTT_ENABLED !== 'false',
    host: process.env.MQTT_HOST || '',
    port: Number(process.env.MQTT_PORT || 8883),
    username: process.env.MQTT_USERNAME || '',
    password: process.env.MQTT_PASSWORD || '',
    clientId: process.env.MQTT_CLIENT_ID || `teaguard-model-${process.pid}`,
    vitalsTopic: process.env.MQTT_VITALS_TOPIC || 'wearable/+/vitals',
    statusTopic: process.env.MQTT_STATUS_TOPIC || 'wearable/+/status',
    reconnectPeriodMs: Number(process.env.MQTT_RECONNECT_PERIOD_MS || 5000),
    offlineAfterMs: Number(process.env.MQTT_DEVICE_OFFLINE_AFTER_MS || 15000),
    windowMs: iotWindowMs,
    minimumWindowSpanMs: iotMinimumWindowSpanMs,
    minimumReadings: Number(process.env.IOT_MIN_VALID_READINGS || 20),
    maxReadingsPerDevice: Number(process.env.IOT_MAX_READINGS_PER_DEVICE || 600),
  },
  spaces: {
    teaLeafDetection: {
      token: process.env.HF_TEA_LEAF_DETECTION_TOKEN || '',
      space: process.env.HF_TEA_LEAF_DETECTION_SPACE || '',
      apiUrl: process.env.HF_TEA_LEAF_DETECTION_API_URL || '',
    },
    teaLeafDisease: {
      token: process.env.HF_TEA_LEAF_DISEASE_TOKEN || '',
      space: process.env.HF_TEA_LEAF_DISEASE_SPACE || 'ravidumiuranga/Disises',
      apiUrl: process.env.HF_TEA_LEAF_DISEASE_API_URL || 'https://ravidumiuranga-disises.hf.space/gradio_api/call/v2/predict',
      minConfidence: Number(process.env.HF_TEA_LEAF_DISEASE_MIN_CONFIDENCE || 0.7),
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
