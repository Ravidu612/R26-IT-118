import mongoose from 'mongoose'
import dns from 'dns'
import env from './env.js'

const createMongoLookup = () => {
  return async (hostname, options, callback) => {
    const done = typeof options === 'function' ? options : callback
    const lookupOptions = typeof options === 'object' ? options : {}

    try {
      const addresses = await dns.promises.resolve4(hostname)
      if (lookupOptions.all) {
        done(null, addresses.map((address) => ({ address, family: 4 })))
        return
      }
      done(null, addresses[0], 4)
    } catch (error) {
      done(error)
    }
  }
}

export const connectDb = async () => {
  if (!env.mongoUri) {
    throw new Error('MONGODB_URI is required')
  }
  if (env.dnsServers.length > 0) {
    dns.setServers(env.dnsServers)
  }
  const mongoOptions = {
    serverSelectionTimeoutMS: env.mongoServerSelectionTimeoutMs,
  }
  if (env.dnsServers.length > 0) {
    mongoOptions.lookup = createMongoLookup()
  }
  try {
    await mongoose.connect(env.mongoUri, mongoOptions)
  } catch (error) {
    throw new Error(`MongoDB connection failed: ${error.message}`)
  }
}
