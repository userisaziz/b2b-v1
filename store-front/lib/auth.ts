import apiClient from './api';

export interface LoginData {
  email: string;
  password: string;
  role?: 'buyer' | 'seller';
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  company?: string;
  role?: 'buyer' | 'seller';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status?: string;
  company?: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  supabaseSession?: {
    access_token: string;
    refresh_token: string;
  };
}

// Login
export const login = async (data: LoginData & { role?: string }): Promise<AuthResponse> => {
  const role = data.role || 'buyer'; // Default to buyer if not specified
  const endpoint = role === 'seller' ? '/seller/login' : '/buyer/login';
  const response = await apiClient.post(endpoint, data);
  return response.data.data;
};

// Register
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const role = data.role || 'buyer';
  const endpoint = role === 'seller' ? '/seller/register' : '/buyer/register';
  const response = await apiClient.post(endpoint, data);
  return response.data.data;
};

// Get current user
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Logout
export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};
