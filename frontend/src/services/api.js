import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // If data is FormData, don't set Content-Type (let axios handle it)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      // Fix: पेज रीलोड करने के बजाय सिर्फ टोकन हटाएं। 
      // अगर हम यहाँ window.location.href = '/login' करेंगे तो वो एरर देगा।
      // UI अपने आप अपडेट हो जाएगा या यूजर खुद लॉगिन बटन दबाएगा।
    }
    return Promise.reject(error);
  }
);

export default api;