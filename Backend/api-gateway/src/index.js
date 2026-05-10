import mongoose from 'mongoose'
import app from './app.js'
import env from './config/env.js'

mongoose
  .connect(env.mongoUri)
  .then(() => console.log('MongoDB connected for API Gateway'))
  .catch((err) => console.log('API Gateway MongoDB connection error:', err))

app.listen(env.port, () => {
  console.log(`api-gateway listening on port ${env.port}`)
})