import mongoose from 'mongoose'
import env from './env.js'

export const connectDb = async () => {
  if (!env.mongoUri) {
    throw new Error('MONGODB_URI is required')
  }
  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: env.mongoServerSelectionTimeoutMs,
    })
  } catch (error) {
    throw new Error(`MongoDB connection failed: ${error.message}`)
  }
}
