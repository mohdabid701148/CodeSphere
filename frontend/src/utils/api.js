import axios from 'axios';

// Create a reusable, configured Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject Access Token into the headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Handle global errors and perform silent token refreshes
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if unauthorized (401) and request has not been retried yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      
      // If refresh token request itself failed with 401, clear credentials and reject
      if (originalRequest.url === '/auth/refresh-token' || originalRequest.url === '/auth/logout') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('authChange'));
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          console.log('Access token expired. Retrying with refresh token...');
          const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const refreshRes = await axios.post(`${baseURL}/auth/refresh-token`, { refreshToken });

          if (refreshRes.data?.success) {
            const { accessToken: newAccess, refreshToken: newRefresh } = refreshRes.data.data;
            
            // Set the new rotated tokens
            localStorage.setItem('accessToken', newAccess);
            localStorage.setItem('refreshToken', newRefresh);
            window.dispatchEvent(new Event('authChange'));
            
            isRefreshing = false;
            processQueue(null, newAccess);

            // Retry the original request with the new access token
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            return api(originalRequest);
          }
        } catch (refreshErr) {
          console.error('Refresh token expired or invalid. Logging out...', refreshErr);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.dispatchEvent(new Event('authChange'));
          
          isRefreshing = false;
          processQueue(refreshErr, null);
          
          if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
            window.location.href = '/login?error=' + encodeURIComponent('Your session has expired. Please sign in again.');
          }
          return Promise.reject(refreshErr);
        }
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('authChange'));
        isRefreshing = false;
        
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
