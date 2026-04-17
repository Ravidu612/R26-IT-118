const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  region: { type: String, required: true },
  disease: { type: String, required: true },
  score: { type: Number, required: true },
  level: { type: String, enum: ['High', 'Medium'], required: true },
  message: { type: String, required: true },
  acknowledged: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);