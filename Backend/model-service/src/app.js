import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import modelRoutes from './routes/modelRoutes.js'
import predictionRoutes from './routes/predictionRoutes.js'
import taskRoutes from './routes/taskRoutes.js'

const app = express()

app.use(helmet())
app.use(cors({ origin: true, credentials: true }))
app.use(morgan('dev'))
app.use(express.json({ limit: '12mb' }))

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'model-service is running' })
})

app.use('/internal/models', modelRoutes)
app.use('/internal/predictions', predictionRoutes)
app.use('/internal/tasks', taskRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
