import api from './api';

export interface RFQ {
  _id: string;
  title: string;
  description: string;
  productId?: string;
  categoryId?: string;
  quantity: number;
  unit: string;
  buyerId?: string;
  adminId?: string;
  status: string;
  distributionType: string;
  targetSellerIds: string[];
  responses: RFQResponse[];
  expiryDate?: string;
  specifications?: Record<string, string>;
  attachments?: RFQAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface RFQResponse {
  sellerId: string;
  quotePrice: number;
  quoteQuantity: number;
  deliveryTime: number;
  message: string;
  status: string;
  submittedAt: string;
}

export interface RFQAttachment {
  url: string;
  name: string;
  type: string;
}

export interface CreateRFQData {
  title: string;
  description: string;
  productId?: string;
  categoryId?: string;
  quantity: number;
  unit: string;
  buyerId?: string;
  distributionType: string;
  targetSellerIds?: string[];
  expiryDate?: string;
  specifications?: Record<string, string>;
}

export interface SubmitQuoteData {
  quotePrice: number;
  quoteQuantity?: number;
  deliveryTime: number;
  message: string;
}

// Get all RFQs for the logged-in seller
export const getSellerRFQs = async (params?: { status?: string }) => {
  const queryParams = new URLSearchParams(params as any).toString();
  const url = `/rfqs/seller/my-rfqs${queryParams ? `?${queryParams}` : ''}`;
  const response = await api.get(url);
  return response.data;
};

// Get a specific RFQ by ID
export const getRFQById = async (id: string) => {
  const response = await api.get(`/rfqs/${id}`);
  return response.data;
};

// Submit quote response to RFQ
export const submitQuote = async (id: string, data: SubmitQuoteData) => {
  const response = await api.post(`/rfqs/${id}/quote`, data);
  return response.data;
};

// Get RFQs created by current buyer (if applicable)
export const getMyCreatedRFQs = async (params?: { status?: string }) => {
  const queryParams = new URLSearchParams(params as any).toString();
  const url = `/rfqs/buyer/my-rfqs${queryParams ? `?${queryParams}` : ''}`;
  const response = await api.get(url);
  return response.data;
};