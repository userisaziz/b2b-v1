import api from './api';

export interface Seller {
  _id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  businessType: string;
  approvalStatus: string;
  isVerified: boolean;
  createdAt: string;
  totalProducts?: number;
  revenue?: string;
}

export const getSellers = async (status?: string) => {
    const query = status ? `?approvalStatus=${status}` : '';
    const response = await api.get(`/sellers${query}`);
    return response.data;
};

export const getSeller = async (id: string) => {
    const response = await api.get(`/sellers/${id}`);
    return response.data;
};

export const approveSeller = async (id: string) => {
    const response = await api.patch(`/sellers/${id}/approval`);
    return response.data;
};

export const rejectSeller = async (id: string, rejectionReason: string) => {
    const response = await api.delete(`/sellers/${id}/approval`, { data: { rejectionReason } });
    return response.data;
};