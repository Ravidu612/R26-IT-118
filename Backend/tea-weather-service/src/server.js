const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const weatherRoutes = require('./routes/weather');
const alertRoutes = require('./routes/alerts');
const { fetchAndSaveWeather } = require('./services/weatherService');

dotenv.config();
const app = express();

connectDB();

// Fetch weather immediately on startup, then every 5 minutes
fetchAndSaveWeather();
setInterval(fetchAndSaveWeather, 5 * 60 * 1000);

app.use(cors());
app.use(express.json());

app.use('/api/weather', weatherRoutes);
app.use('/api/alerts', alertRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Tea Weather Intelligence API is running!', status: 'success' });
});

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});