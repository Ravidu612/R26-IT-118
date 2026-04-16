const express = require('express');
const router = express.Router();
const WeatherReading = require('../models/WeatherReading');

// GET all weather readings
router.get('/', async (req, res) => {
  try {
    const readings = await WeatherReading.find().sort({ timestamp: -1 }).limit(50);
    res.json({ success: true, data: readings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET weather by location
router.get('/:location', async (req, res) => {
  try {
    const readings = await WeatherReading.find({
      'location.name': req.params.location
    }).sort({ timestamp: -1 }).limit(20);
    res.json({ success: true, data: readings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST a new weather reading (for testing)
router.post('/', async (req, res) => {
  try {
    const reading = new WeatherReading(req.body);
    const saved = await reading.save();
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;