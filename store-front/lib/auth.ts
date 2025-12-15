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
  businessType?: string;
  taxNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
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
}

// Login
export const login = async (data: LoginData & { role?: string }): Promise<AuthResponse> => {
  const role = data.role || 'buyer'; // Default to buyer if not specified
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
  
  // For buyer registration, we only send the required fields
  if (role === 'buyer') {
    const buyerData = {
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone
    };
    const response = await apiClient.post(endpoint, buyerData);
    return {
      token: response.data.token,
      user: {
        id: response.data.data.id,
        email: response.data.data.email,
        name: response.data.data.name,
        role: 'buyer'
      }
    };
  } else {
    // For seller registration, map form data to expected backend fields
    const sellerData = {
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      companyName: data.company,
      businessType: data.businessType,
      taxId: data.taxNumber,
      businessAddress: {
        street: data.address,
        city: data.city,
        region: data.state,
        postalCode: data.pincode,
        country: "Saudi Arabia" // Default to Saudi Arabia as per requirements
      }
    };
    const response = await apiClient.post(endpoint, sellerData);
    return response.data;
  }
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