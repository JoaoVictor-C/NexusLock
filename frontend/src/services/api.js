import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: 'http://localhost:5223/api',
});

// Request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const storedAuth = JSON.parse(localStorage.getItem('auth'));
    if (storedAuth && storedAuth.token) {
      config.headers.Authorization = `Bearer ${storedAuth.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;