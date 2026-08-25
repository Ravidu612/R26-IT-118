const mongoose = require('mongoose');

const weatherReadingSchema = new mongoose.Schema({
  location: {
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  timestamp: { type: Date, default: Date.now },
  temperature: {
    min: Number,
    max: Number,
    current: Number,
    feelsLike: Number,   // ← ADDED
  },
  humidity: Number,
  rainfall: Number,
  windSpeed: Number,
  sunshine: Number,
  source: { type: String, default: 'openweather' }
}, { timestamps: true });

module.exports = mongoose.model('WeatherReading', weatherReadingSchema);