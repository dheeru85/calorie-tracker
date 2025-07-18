import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    return api.post('/auth/login', formData);
  },
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/me', profileData),
};

export const foodAPI = {
  searchFoods: (query, page = 1, pageSize = 20) => 
    api.get('/food/search', { params: { query, page, page_size: pageSize } }),
  getFoodDetails: (fdcId) => api.get(`/food/details/${fdcId}`),
  createCustomFood: (foodData) => api.post('/food/custom', foodData),
  getCustomFoods: () => api.get('/food/custom'),
  deleteCustomFood: (foodId) => api.delete(`/food/custom/${foodId}`),
  getPopularFoods: () => api.get('/food/popular'),
};

export const diaryAPI = {
  createEntry: (entryData) => api.post('/diary/entries', entryData),
  getEntries: (date, mealType) => 
    api.get('/diary/entries', { params: { date_filter: date, meal_type: mealType } }),
  getDailySummary: (date) => api.get(`/diary/summary/${date}`),
  updateEntry: (entryId, updateData) => api.put(`/diary/entries/${entryId}`, updateData),
  deleteEntry: (entryId) => api.delete(`/diary/entries/${entryId}`),
  logWeight: (weightData) => api.post('/diary/weight', weightData),
  getWeightEntries: (limit = 30) => api.get('/diary/weight', { params: { limit } }),
};

export default api;