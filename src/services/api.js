import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔥 IMPORTANT: Apna IP address daalo (ipconfig se dekho)
const API_URL = 'http://192.168.0.148:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - har request mein token add karo
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
};

// User APIs
export const userAPI = {
  updateProfile: (userData) => api.put('/users/profile', userData),
};

// Workout APIs
export const workoutAPI = {
  saveWorkout: (workoutData) => api.post('/workouts', workoutData),
  getHistory: () => api.get('/workouts'),
};

export default api;