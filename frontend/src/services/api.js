import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

export const getWeatherData = () => API.get('/api/weather');
export const getWeatherByLocation = (location) => API.get(`/api/weather/${encodeURIComponent(location)}`);
export const getWeatherForecast = (location) => API.get(`/api/weather/forecast/${encodeURIComponent(location)}`);
export const getWeatherHistory = (location) => API.get(`/api/weather/history/${encodeURIComponent(location)}`);
export const getPredictions = (location) =>
  API.get(`/api/weather/predict/${encodeURIComponent(location)}`).then(r => r.data);

export default API;