import axios from 'axios';
import { isTokenExpired } from '../utils/auth';

// Create an axios instance
const api = axios.create({
  baseURL: 'https://nexuslock-941324057012.southamerica-east1.run.app/api',
});

// Request interceptor to attach token and check for token expiration
api.interceptors.request.use(
  async (config) => {
    const storedAuth = JSON.parse(localStorage.getItem('auth'));
    if (storedAuth) {
      config.headers.Authorization = `Bearer ${storedAuth.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const tokenExpired = await isTokenExpired();
    if (tokenExpired) {
      localStorage.removeItem('auth');
      return Promise.reject('Token expired');
    }
    return Promise.reject(error);
  }
);

export default api;
