import axios, { InternalAxiosRequestConfig, AxiosInstance } from 'axios';
import { auth, getAppCheckToken } from './firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create axios instance
const httpClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add tokens
httpClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // 1. Add Firebase Auth Token if user is logged in
      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 2. Add AppCheck Token if available
      const appCheckToken = await getAppCheckToken();
      if (appCheckToken) {
        config.headers['X-Firebase-AppCheck'] = appCheckToken;
      }
    } catch (error) {
      console.warn('Error adding tokens to request:', error);
      // Proceed without tokens if getting them fails
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default httpClient;
