import mongoose from 'mongoose'

const modelApiLogSchema = new mongoose.Schema(
  {
    moduleType: { type: String, required: true },
    space: { type: String, required: true },
    requestStatus: { type: String, enum: ['success', 'error', 'placeholder'], required: true },
    latencyMs: { type: Number, default: 0 },
    detail: { type: Object, default: {} },
  },
  { timestamps: true },
)

const ModelApiLog = mongoose.model('ModelApiLog', modelApiLogSchema)

export default ModelApiLog
