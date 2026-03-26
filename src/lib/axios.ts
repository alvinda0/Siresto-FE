// lib/axios.ts
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACK_END_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle blob errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle blob error responses
    if (error.response && error.response.data instanceof Blob && error.response.status >= 400) {
      try {
        const errorText = await error.response.data.text();
        const errorData = JSON.parse(errorText);
        
        // Create new error with parsed data
        const newError = new Error(errorData.error?.message || errorData.message || error.message);
        (newError as any).response = {
          ...error.response,
          data: errorData
        };
        
        return Promise.reject(newError);
      } catch (parseError) {
        // If parsing fails, return original error
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
)