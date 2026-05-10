import app from './app.js'
import { connectDb } from './config/db.js'
import env from './config/env.js'

const start = async () => {
  try {
    await connectDb()
    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`auth-service listening on port ${env.port}`)
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('auth-service failed to start:', error.message)
    process.exit(1)
  }
}

start()
