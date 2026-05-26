import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

const secureCookieOptions = {
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
};

// Request interceptor: attach token
api.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor: handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url ?? '';
    
    const statusCode = error.response?.status;

    // Treat 401/403 from protected endpoints as a signal to refresh once.
    if ((statusCode === 401 || statusCode === 403) && originalRequest && !originalRequest._retry && !requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/register') && !requestUrl.includes('/auth/refresh')) {
      originalRequest._retry = true;
      try {
        const refreshToken = Cookies.get('refreshToken');

        // Attempt refresh via credentials and keep legacy token body for compatibility.
        const refreshPayload = refreshToken ? { refreshToken } : {};
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, refreshPayload, {
          withCredentials: true,
        });
        if (!res.data?.accessToken) {
          throw new Error('Refresh response missing access token');
        }
        
        // Save new token
        Cookies.set('accessToken', res.data.accessToken, { expires: 1 / 96, ...secureCookieOptions }); // 15 mins
        
        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
