import axios from 'axios';
import { isTokenExpired } from '../utils/auth';

const api = axios.create({
  baseURL: 'https://nexuslock-941324057012.southamerica-east1.run.app/api',
});

api.interceptors.request.use(
  async (config) => {
    const storedAuth = JSON.parse(localStorage.getItem('auth'));
    if (storedAuth && storedAuth.token) {
      if (isTokenExpired(storedAuth.token)) {
        // Token is expired. Redirect to login.
        localStorage.removeItem('auth');
        window.location.href = '/login';
        return Promise.reject(new Error('Token expired'));
      } else {
        config.headers.Authorization = `Bearer ${storedAuth.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
