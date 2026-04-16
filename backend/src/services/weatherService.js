const axios = require('axios');
const WeatherReading = require('../models/WeatherReading');

const TEA_REGIONS = [
  { name: 'Nuwara Eliya', latitude: 6.9497, longitude: 80.7891 },
  { name: 'Kandy', latitude: 7.2906, longitude: 80.6337 },
  { name: 'Ratnapura', latitude: 6.6828, longitude: 80.3992 }
];

const fetchAndSaveWeather = async () => {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  for (const region of TEA_REGIONS) {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${region.latitude}&lon=${region.longitude}&appid=${apiKey}&units=metric`;
      const response = await axios.get(url);
      const data = response.data;

      const reading = new WeatherReading({
        location: {
          name: region.name,
          latitude: region.latitude,
          longitude: region.longitude
        },
        temperature: {
          min: data.main.temp_min,
          max: data.main.temp_max,
          current: data.main.temp
        },
        humidity: data.main.humidity,
        rainfall: data.rain ? data.rain['1h'] || 0 : 0,
        windSpeed: data.wind.speed,
        sunshine: 0,
        source: 'openweather'
      });

      await reading.save();
      console.log(`Weather saved for ${region.name}`);

    } catch (error) {
      console.error(`Failed to fetch weather for ${region.name}:`, error.message);
    }
  }
};

module.exports = { fetchAndSaveWeather, TEA_REGIONS };