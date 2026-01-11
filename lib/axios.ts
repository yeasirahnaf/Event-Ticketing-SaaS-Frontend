import axios from 'axios';

// Create Axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:7000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for HttpOnly cookies
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle global errors here
    if (error.response) {
      // Server responded with a status code outside of 2xx
      // Don't log expected auth errors (401/403) - let consuming code handle
      if (error.response.status !== 401 && error.response.status !== 403) {
        console.error('API Error:', error.response.data);
      }
      if (error.response.status === 401) {
        // Handle unauthorized access (e.g., redirect to login)
        // console.warn('Unauthorized access. Redirecting to login...'); // Suppress this
        // window.location.href = '/login'; // Uncomment if needed
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network Error:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;