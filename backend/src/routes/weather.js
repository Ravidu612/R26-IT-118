const express = require('express');
const router = express.Router();
const axios = require('axios');
const WeatherReading = require('../models/WeatherReading');
const { TEA_REGIONS } = require('../services/weatherService');

// GET all weather readings
router.get('/', async (req, res) => {
  try {
    const readings = await WeatherReading.find()
      .sort({ timestamp: -1 })
      .limit(50);
    res.json({ success: true, data: readings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET 5-day forecast for a location
router.get('/forecast/:location', async (req, res) => {
  try {
    const region = TEA_REGIONS.find(r => r.name === req.params.location);
    if (!region) return res.status(404).json({ error: 'Region not found' });

    const apiKey = process.env.OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${region.latitude}&lon=${region.longitude}&appid=${apiKey}&units=metric`;
    const response = await axios.get(url);

    const daily = {};
    response.data.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toISOString().split('T')[0];
      const hour = date.getHours();
      if (!daily[dayKey] || Math.abs(hour - 12) < Math.abs(new Date(daily[dayKey].dt * 1000).getHours() - 12)) {
        daily[dayKey] = item;
      }
    });

    const forecast = Object.values(daily).map((item, index) => {
      const date = new Date(item.dt * 1000);
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return {
        day: index === 0 ? 'Today' : dayNames[date.getUTCDay()],
        high: Math.round(item.main.temp_max),
        low: Math.round(item.main.temp_min),
        rain: item.rain ? +(item.rain['3h'] || 0).toFixed(1) : 0,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        weatherMain: item.weather[0].main,
      };
    });

    res.json({ success: true, data: forecast });
  } catch (error) {
    console.error('Forecast fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch forecast' });
  }
});

// GET last 24h temperature history for a location
router.get('/history/:location', async (req, res) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const readings = await WeatherReading.find({
      'location.name': req.params.location,
      timestamp: { $gte: since }
    })
    .sort({ timestamp: 1 })
    .select('temperature.current timestamp');

    const data = readings.map(r => ({
      time: new Date(r.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: false
      }),
      temp: r.temperature?.current
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET weather by location
router.get('/:location', async (req, res) => {
  try {
    const reading = await WeatherReading.findOne({
      'location.name': req.params.location
    }).sort({ timestamp: -1 });
    if (!reading) return res.status(404).json({ error: 'Location not found' });
    res.json({ success: true, data: reading });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST manually save a weather reading
router.post('/', async (req, res) => {
  try {
    const reading = new WeatherReading(req.body);
    await reading.save();
    res.status(201).json({ success: true, data: reading });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;