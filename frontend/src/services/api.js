import axios from 'axios';
import { isTokenExpired } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Create an axios instance
const api = axios.create({
  baseURL: 'https://nexuslock-941324057012.southamerica-east1.run.app/api',
});

// Request interceptor to attach token
api.interceptors.request.use(
  async (config) => {
    const storedAuth = JSON.parse(localStorage.getItem('auth'));
    if (storedAuth && !await isTokenExpired()) {
      config.headers.Authorization = `Bearer ${storedAuth.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
