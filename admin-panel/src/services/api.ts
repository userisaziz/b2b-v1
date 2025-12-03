import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://b2b-v1-backend.vercel.app/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
   
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
    (config) => {
        console.log('[API] Request config:', config);
        const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
        console.log('[API] Token from localStorage:', token);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('[API] Authorization header set:', config.headers.Authorization);
        } else {
            console.log('[API] No token found in localStorage');
        }
        return config;
    },
    (error) => {
        console.error('[API] Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor to log responses
api.interceptors.response.use(
    (response) => {
        console.log('[API] Response:', response);
        return response;
    },
    (error) => {
        console.error('[API] Response error:', error);
        return Promise.reject(error);
    }
);

export default api;