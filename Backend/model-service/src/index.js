import app from './app.js'
import { connectDb } from './config/db.js'
import env from './config/env.js'
import { startIotIntegration } from './services/iot/iotService.js'

const start = async () => {
  try {
    await connectDb()
    startIotIntegration()
    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`model-service listening on port ${env.port}`)
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('model-service failed to start:', error.message)
    process.exit(1)
  }
}

start()
