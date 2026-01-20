import axios, { AxiosError } from 'axios';
import { ApiErrorResponse } from '../types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 60000, // 60 seconds to handle Render free tier cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    // Network error (no response)
    if (!error.response) {
      return Promise.reject({
        success: false,
        message: 'Network error. Please check your connection.',
      });
    }

    // Server responded with error
    const { data } = error.response;

    return Promise.reject({
      success: false,
      message: data?.message || 'Something went wrong',
      errors: data?.errors,
    });
  }
);

export default api;
