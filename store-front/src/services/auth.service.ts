import axios from 'axios';
import apiClient from '@/lib/api';

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
  // Use the unified login endpoint for all user types
  const endpoint = '/auth/login';
  const response = await apiClient.post(endpoint, data);
  
  // Handle the response structure from backend
  const responseData = response.data;
  
  // Map the backend response to our expected structure
  return {
    token: responseData.token,
    user: {
      id: responseData.data.id,
      email: responseData.data.email,
      name: responseData.data.name,
      role: responseData.data.userType
    }
  };
};

// Register
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const role = data.role || 'buyer';
  const endpoint = role === 'seller' ? '/auth/seller/register' : '/auth/buyer/register';
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

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('token');
  return !!token;
};

// Get user role
export const getUserRole = (): string | null => {
  const user = getCurrentUser();
  return user ? user.role : null;
};
