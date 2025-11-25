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

// Get all RFQs (admin only)
export const getAllRFQs = async (params?: { status?: string }) => {
  const queryParams = new URLSearchParams(params as any).toString();
  const url = `/rfqs${queryParams ? `?${queryParams}` : ''}`;
  const response = await api.get(url);
  return response.data;
};

// Get RFQ by ID (admin only)
export const getRFQById = async (id: string) => {
  const response = await api.get(`/rfqs/${id}`);
  return response.data;
};

// Create RFQ (admin or buyer)
export const createRFQ = async (data: CreateRFQData) => {
  const response = await api.post('/rfqs', data);
  return response.data;
};

// Update RFQ (admin or buyer)
export const updateRFQ = async (id: string, data: Partial<CreateRFQData>) => {
  const response = await api.put(`/rfqs/${id}`, data);
  return response.data;
};

// Delete RFQ (admin or buyer)
export const deleteRFQ = async (id: string) => {
  const response = await api.delete(`/rfqs/${id}`);
  return response.data;
};

// Distribute RFQ to specific sellers (admin only)
export const distributeRFQ = async (id: string, sellerIds: string[]) => {
  const response = await api.post(`/rfqs/${id}/distribute`, { sellerIds });
  return response.data;
};

// Submit quote response to RFQ (seller only)
export const submitQuote = async (id: string, data: SubmitQuoteData) => {
  const response = await api.post(`/rfqs/${id}/quote`, data);
  return response.data;
};

// Get RFQs for current seller
export const getMyRFQs = async (params?: { status?: string }) => {
  const queryParams = new URLSearchParams(params as any).toString();
  const url = `/rfqs/seller/my-rfqs${queryParams ? `?${queryParams}` : ''}`;
  const response = await api.get(url);
  return response.data;
};

// Get RFQs created by current buyer
export const getMyCreatedRFQs = async (params?: { status?: string }) => {
  const queryParams = new URLSearchParams(params as any).toString();
  const url = `/rfqs/buyer/my-rfqs${queryParams ? `?${queryParams}` : ''}`;
  const response = await api.get(url);
  return response.data;
};