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
    // If unauthorized, you could potentially trigger a logout action here
    if (error.response && error.response.status === 401) {
      // Avoid redirecting if the endpoint itself is auth/login or me to prevent infinite loops
      if (!error.config.url.includes('/auth/login')) {
        console.error('Unauthorized access - please log in again.')
        // localStorage.removeItem('access_token');
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error)
  }
)

export default api
