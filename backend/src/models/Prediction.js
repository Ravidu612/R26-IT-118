const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  location: { type: String, required: true },
  date: { type: Date, required: true },
  teaQualityScore: { type: Number, min: 0, max: 10 },
  diseaseRisk: {
    blisterBlight: { type: String, enum: ['low', 'medium', 'high'] },
    redSpiderMite: { type: String, enum: ['low', 'medium', 'high'] }
  },
  irrigationNeeded: { type: Boolean, default: false },
  modelUsed: String, // 'LSTM' or 'RandomForest'
  confidence: Number
}, { timestamps: true });

module.exports = mongoose.model('Prediction', predictionSchema);