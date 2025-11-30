import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
    (config) => {
        console.log('[Seller API] Request config:', config);
        const token = localStorage.getItem('sellerToken'); // Using sellerToken for seller panel
        console.log('[Seller API] Token from localStorage:', token);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('[Seller API] Authorization header set:', config.headers.Authorization);
        } else {
            console.log('[Seller API] No token found in localStorage');
        }
        return config;
    },
    (error) => {
        console.error('[Seller API] Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor to log responses
api.interceptors.response.use(
    (response) => {
        console.log('[Seller API] Response:', response);
        return response;
    },
    (error) => {
        console.error('[Seller API] Response error:', error);
        return Promise.reject(error);
    }
);

export default api;