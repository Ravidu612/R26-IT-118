import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

export const getWeatherData = () => API.get('/api/weather');
export const getWeatherByLocation = (location) => API.get(`/api/weather/${location}`);

export default API;