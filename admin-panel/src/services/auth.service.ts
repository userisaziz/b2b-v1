import api from './api';
import { jwtDecode } from 'jwt-decode';

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  data?: {
    id: string;
    name: string;
    email: string;
    userType: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface JwtPayload {
  id: string;
  userType: string;
  exp: number;
  iat: number;
}

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: 'Network error. Please try again.'
    };
  }
};

export const setAuthToken = (token: string) => {
  localStorage.setItem('token', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('token');
};

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  return !!token;
};

export const getUserTypeFromToken = (): string | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const decoded: JwtPayload = jwtDecode(token);
    return decoded.userType;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const isTokenExpired = (): boolean => {
  const token = localStorage.getItem('token');
  if (!token) return true;
  
  try {
    const decoded: JwtPayload = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};