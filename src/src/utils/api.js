import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config';

// Create an axios instance with base URL
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If status is 401 (Unauthorized) and we haven't retried yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Here you could implement token refresh logic if needed
      // For simplicity, we'll just log out the user if token is invalid
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userInfo');
      
      // You would typically redirect to login screen here, but we'll 
      // handle that in the component using context
    }
    
    return Promise.reject(error);
  }
);

// API functions
export const login = async (username, password) => {
  try {
    const response = await api.post('/api-token-auth/', { username, password });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const getDepotProfile = async () => {
  try {
    const response = await api.get('/api/v1/depots/me/');
    return response.data;
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
};

export const updateLoginStatus = async () => {
  try {
    await api.post('/api/v1/depots/update_login/');
  } catch (error) {
    console.error('Update login status error:', error);
  }
};

export const getMessages = async (page = 1) => {
  console.log("jeev");
  try {
    const response = await api.get(`/api/v1/messages/?page=${page}`);
    return response.data;
  } catch (error) {
    console.error('Get messages error:', error);
    throw error;
  }
};

export const getUnreadMessages = async () => {
  try {
    const response = await api.get('/api/v1/messages/unread/');
    return response.data;
  } catch (error) {
    console.error('Get unread messages error:', error);
    throw error;
  }
};

export const markMessageAsRead = async (messageId) => {
  try {
    await api.post(`/api/v1/messages/${messageId}/mark_as_read/`);
  } catch (error) {
    console.error('Mark message as read error:', error);
    throw error;
  }
};

export const sendMessage = async (content) => {
  try {
    const response = await api.post('/api/v1/messages/send_to_officer/', { content });
    return response.data;
  } catch (error) {
    console.error('Send message error:', error);
    throw error;
  }
};

export const getSchedules = async (page = 1) => {
  try {
    const response = await api.get(`/api/v1/schedules/?page=${page}`);
    return response.data;
  } catch (error) {
    console.error('Get schedules error:', error);
    throw error;
  }
};

export const getAnnouncements = async (page = 1) => {
  try {
    const response = await api.get(`/api/v1/announcements/?page=${page}`);
    return response.data;
  } catch (error) {
    console.error('Get announcements error:', error);
    throw error;
  }
};

export default api;