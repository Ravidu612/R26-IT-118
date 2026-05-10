import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import env from './config/env.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import authRoutes from './routes/authRoutes.js'

const app = express()

app.use(helmet())
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  }),
)
app.use(morgan('dev'))
app.use(express.json({ limit: '2mb' }))
app.use(cookieParser())

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'auth-service is running' })
})

app.use('/internal/auth', authRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
