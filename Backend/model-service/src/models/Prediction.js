import mongoose from 'mongoose'

const predictionSchema = new mongoose.Schema(
  {
    moduleType: { type: String, required: true },
    imageMeta: {
      fileName: String,
      mimeType: String,
    },
    inputPayload: { type: Object, default: {} },
    result: { type: Object, required: true },
    createdBy: { type: String, default: null },
  },
  { timestamps: true },
)

const Prediction = mongoose.model('Prediction', predictionSchema)

export default Prediction
