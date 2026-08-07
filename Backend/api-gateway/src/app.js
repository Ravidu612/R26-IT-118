import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import env from './config/env.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import authRoutes from './routes/authRoutes.js'
import iotRoutes from './routes/iotRoutes.js'
import modelRoutes from './routes/modelRoutes.js'
import predictionRoutes from './routes/predictionRoutes.js'
import taskRoutes from './routes/taskRoutes.js'
import workerRoutes from './routes/workerRoutes.js'

const app = express()

app.use(helmet())
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  }),
)
app.use(morgan('dev'))
app.use(express.json({ limit: '12mb' }))
app.use(cookieParser())

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'api-gateway is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/iot', iotRoutes)
app.use('/api/models', modelRoutes)
app.use('/api/predictions', predictionRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/workers', workerRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
