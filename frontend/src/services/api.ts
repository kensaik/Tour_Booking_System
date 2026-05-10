import axios from 'axios'

// Create an Axios instance
const api = axios.create({
  baseURL: '/api', // Using Vite proxy configured in vite.config.ts
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // If unauthorized (401), trigger logout
    if (error.response && error.response.status === 401) {
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('access_token')
        window.location.href = '/login'
      }
    }
    // If forbidden (403) - just let the component handle it
    if (error.response && error.response.status === 403) {
      console.warn('Forbidden access:', error.response.data?.message)
    }
    return Promise.reject(error)
  }
)

export default api
