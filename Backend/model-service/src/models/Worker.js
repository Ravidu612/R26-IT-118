import mongoose from 'mongoose'

const workerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    healthStatus: { type: String, default: 'Unknown' },
    status: { type: String, default: 'Active' },
    latestHr: { type: Number, default: null },
    latestSpo2: { type: Number, default: null },
    createdBy: { type: String, default: null },
  },
  { timestamps: true },
)

workerSchema.index({ createdBy: 1, name: 1 })

const Worker = mongoose.model('Worker', workerSchema)

export default Worker
