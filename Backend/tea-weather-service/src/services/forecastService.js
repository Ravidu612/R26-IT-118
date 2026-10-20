const axios = require('axios');
const WeatherReading = require('../models/WeatherReading');
const { TEA_REGIONS } = require('./weatherService');

// Builds `hours` hourly points starting now: the latest live reading (if fresh), then
// OpenWeather's 3-hourly forecast linearly interpolated to 1-hour steps.
async function buildHourlyForecast(regionName, hours = 8) {
  const region = TEA_REGIONS.find((r) => r.name === regionName);
  if (!region) {
    const err = new Error('Region not found');
    err.status = 404;
    throw err;
  }

  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${region.latitude}&lon=${region.longitude}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
  const { data } = await axios.get(url, { timeout: 10000 });
  const now = Date.now();

  const points = data.list.map((it) => ({
    t: it.dt * 1000,
    temp: it.main.temp,
    humidity: it.main.humidity,
    rain: (it.rain && it.rain['3h'] ? it.rain['3h'] : 0) / 3, // mm per hour
  }));

  const latest = await WeatherReading.findOne({ 'location.name': regionName }).sort({ timestamp: -1 });
  if (latest && now - new Date(latest.timestamp).getTime() < 3 * 3600 * 1000) {
    points.push({ t: now, temp: latest.temperature?.current, humidity: latest.humidity, rain: latest.rainfall || 0 });
  }
  points.sort((a, b) => a.t - b.t);
  if (points.length === 0) throw new Error('No weather data available');

  const at = (t) => {
    let prev = points[0];
    let next = points[points.length - 1];
    for (let i = 0; i < points.length - 1; i++) {
      if (points[i].t <= t && t <= points[i + 1].t) { prev = points[i]; next = points[i + 1]; break; }
    }
    const span = next.t - prev.t;
    const w = span > 0 ? Math.min(1, Math.max(0, (t - prev.t) / span)) : 0;
    const mix = (a, b) => a + (b - a) * w;
    return {
      t: new Date(t).toISOString(),
      temp: +mix(prev.temp, next.temp).toFixed(2),
      humidity: +mix(prev.humidity, next.humidity).toFixed(1),
      rainfall: +mix(prev.rain, next.rain).toFixed(2),
    };
  };

  return Array.from({ length: hours }, (_, i) => at(now + i * 3600 * 1000));
}

module.exports = { buildHourlyForecast };
