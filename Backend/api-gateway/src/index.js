import app from './app.js'
import env from './config/env.js'

const server = app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`api-gateway listening on port ${env.port}`)
})

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    // eslint-disable-next-line no-console
    console.error(`Port ${env.port} is already in use. Stop the existing server or set a different PORT.`)
    process.exit(1)
  }

  throw error
})
