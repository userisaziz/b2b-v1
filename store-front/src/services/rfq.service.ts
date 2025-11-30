import apiClient from '@/lib/api';

// RFQ Interfaces
export interface RFQItem {
  _id: string;
  title: string;
  description: string;
  quantity: number;
  unit: string;
  status: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
  productId?: {
    _id: string;
    name: string;
    sku: string;
  };
  categoryId?: {
    _id: string;
    name: string;
  };
  buyerId?: {
    _id: string;
    name: string;
    email: string;
  };
  adminId?: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface CreateRFQData {
  title: string;
  description: string;
  quantity: number;
  unit: string;
  productId?: string;
  categoryId?: string;
  expiryDate?: string;
  specifications?: any;
}

export interface SubmitQuoteData {
  quotePrice: number;
  quoteQuantity?: number;
  deliveryTime?: string;
  message?: string;
}

// Get all RFQs (public)
export const getAllRFQs = async (params?: {
  status?: string;
  categoryId?: string;
  productId?: string;
}): Promise<RFQItem[]> => {
  try {
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `/rfqs${queryParams ? `?${queryParams}` : ''}`;
    const response = await apiClient.get<RFQItem[]>(url);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'An error occurred while fetching RFQs' };
  }
};

// Get RFQ by ID
export const getRFQById = async (id: string): Promise<RFQItem> => {
  try {
    const response = await apiClient.get<RFQItem>(`/rfqs/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'An error occurred while fetching the RFQ' };
  }
};

// Create RFQ (requires authentication as buyer or admin)
export const createRFQ = async (rfqData: CreateRFQData): Promise<any> => {
  try {
    const response = await apiClient.post('/rfqs', rfqData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'An error occurred while creating the RFQ' };
  }
};

// Submit quote (requires authentication as seller)
export const submitQuote = async (rfqId: string, quoteData: SubmitQuoteData): Promise<any> => {
  try {
    const response = await apiClient.post(`/rfqs/${rfqId}/quote`, quoteData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'An error occurred while submitting the quote' };
  }
};

// Get RFQs for current buyer
export const getMyRFQs = async (params?: {
  status?: string;
}): Promise<RFQItem[]> => {
  try {
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `/rfqs/buyer/my-rfqs${queryParams ? `?${queryParams}` : ''}`;
    const response = await apiClient.get<RFQItem[]>(url);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'An error occurred while fetching your RFQs' };
  }
};

// Get RFQs for current seller
export const getRFQsForSeller = async (params?: {
  status?: string;
}): Promise<RFQItem[]> => {
  try {
    const queryParams = new URLSearchParams(params as any).toString();
    const url = `/rfqs/seller/my-rfqs${queryParams ? `?${queryParams}` : ''}`;
    const response = await apiClient.get<RFQItem[]>(url);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'An error occurred while fetching RFQs for sellers' };
  }
};