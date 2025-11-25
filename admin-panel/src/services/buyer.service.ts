import api from './api';

export interface Buyer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  totalOrders?: number;
  spent?: string;
}

export const getBuyers = async (status?: string) => {
    const query = status ? `?status=${status}` : '';
    const response = await api.get(`/buyers${query}`);
    return response.data;
};

export const getBuyer = async (id: string) => {
    const response = await api.get(`/buyers/${id}`);
    return response.data;
};