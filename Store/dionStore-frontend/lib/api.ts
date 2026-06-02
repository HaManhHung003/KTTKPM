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


api.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url ?? '';
    
    const statusCode = error.response?.status;

    
    if ((statusCode === 401 || statusCode === 403) && originalRequest && !originalRequest._retry && !requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/register') && !requestUrl.includes('/auth/refresh')) {
      originalRequest._retry = true;
      try {
        const refreshToken = Cookies.get('refreshToken');

        
        const refreshPayload = refreshToken ? { refreshToken } : {};
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, refreshPayload, {
          withCredentials: true,
        });
        if (!res.data?.accessToken) {
          throw new Error('Refresh response missing access token');
        }
        
        
        Cookies.set('accessToken', res.data.accessToken, { expires: 1 / 96, ...secureCookieOptions }); 
        
        
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        if (typeof window !== 'undefined' && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
