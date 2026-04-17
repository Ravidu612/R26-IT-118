const mongoose = require('mongoose');

const weatherReadingSchema = new mongoose.Schema({
  location: {
    name: { type: String, required: true }, // e.g. "Nuwara Eliya"
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  timestamp: { type: Date, default: Date.now },
  temperature: {
    min: Number,
    max: Number,
    current: Number
  },
  humidity: Number,
  rainfall: Number,
  windSpeed: Number,
  sunshine: Number, // hours
  source: { type: String, default: 'openweather' } // openweather or open-meteo
}, { timestamps: true });

module.exports = mongoose.model('WeatherReading', weatherReadingSchema);