import mongoose from 'mongoose'

const workerHealthRecordSchema = new mongoose.Schema(
  {
    readings: { type: Object, required: true },
    predictionResult: { type: Object, required: true },
    createdBy: { type: String, default: null },
    source: { type: String, enum: ['manual', 'iot'], default: 'manual' },
    deviceId: { type: String, default: null },
    workerName: { type: String, default: null },
    workerId: { type: String, default: null },
  },
  { timestamps: true },
)

const WorkerHealthRecord = mongoose.model('WorkerHealthRecord', workerHealthRecordSchema)

export default WorkerHealthRecord
