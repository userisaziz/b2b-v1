import api from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  phone: string;
  companyName: string;
  businessType: string;
}

export interface Seller {
  _id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  businessType: string;
  approvalStatus: string;
  isVerified: boolean;
}

export interface AuthResponse {
  token: string;
  seller: Seller;
}

// Login seller
export const loginSeller = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

// Signup seller
export const signupSeller = async (data: SignupData): Promise<AuthResponse> => {
  const response = await api.post('/auth/seller/register', data);
  return response.data;
};

// Logout seller
export const logoutSeller = async (): Promise<void> => {
  // Clear token from localStorage or sessionStorage
  localStorage.removeItem('sellerToken');
  // Optionally call backend logout endpoint
  try {
    await api.post('/auth/seller/logout');
  } catch (error) {
    // Ignore logout errors
  }
};

// Get current seller profile
export const getCurrentSeller = async (): Promise<Seller> => {
  const response = await api.get('/auth/profile');
  return response.data.seller;
};