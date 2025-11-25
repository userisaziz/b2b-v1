import api from './api';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
  totalOrders?: number;
  spent?: string;
  totalProducts?: number;
  revenue?: string;
  approvalStatus?: string;
}

export interface CreateSellerData {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  businessType: string;
  password: string;
  crNumber?: string;
  taxNumber?: string;
}

export interface CreateBuyerData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export const getUsers = async (role?: string, status?: string) => {
    // Use separate endpoints for sellers and buyers
    if (role === 'seller') {
        let url = '/sellers';
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        const queryString = params.toString() ? `?${params.toString()}` : '';
        const response = await api.get(`${url}${queryString}`);
        // Add role property to each seller
        return response.data.map((seller: any) => ({ ...seller, role: 'seller' }));
    } 
    else if (role === 'buyer') {
        let url = '/buyers';
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        const queryString = params.toString() ? `?${params.toString()}` : '';
        const response = await api.get(`${url}${queryString}`);
        // Add role property to each buyer
        return response.data.map((buyer: any) => ({ ...buyer, role: 'buyer' }));
    }
    else {
        // Fetch both sellers and buyers and combine them
        try {
            const [sellersRes, buyersRes] = await Promise.all([
                api.get('/sellers'),
                api.get('/buyers')
            ]);
            
            const sellers = sellersRes.data.map((seller: any) => ({ ...seller, role: 'seller' }));
            const buyers = buyersRes.data.map((buyer: any) => ({ ...buyer, role: 'buyer' }));
            
            return [...sellers, ...buyers];
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    }
};

export const getUser = async (id: string, role: string) => {
    if (role === 'seller') {
        const response = await api.get(`/sellers/${id}`);
        return { ...response.data, role: 'seller' };
    } else if (role === 'buyer') {
        const response = await api.get(`/buyers/${id}`);
        return { ...response.data, role: 'buyer' };
    }
    throw new Error('Invalid user role');
};

export const deactivateUser = async (id: string, role: string) => {
    if (role === 'seller') {
        const response = await api.put(`/sellers/${id}/deactivate`);
        return { ...response.data, role: 'seller' };
    } else if (role === 'buyer') {
        const response = await api.put(`/buyers/${id}/deactivate`);
        return { ...response.data, role: 'buyer' };
    }
    throw new Error('Invalid user role');
};

export const activateUser = async (id: string, role: string) => {
    if (role === 'seller') {
        const response = await api.put(`/sellers/${id}/activate`);
        return { ...response.data, role: 'seller' };
    } else if (role === 'buyer') {
        const response = await api.put(`/buyers/${id}/activate`);
        return { ...response.data, role: 'buyer' };
    }
    throw new Error('Invalid user role');
};

export const createSeller = async (data: CreateSellerData) => {
    const response = await api.post('/admin/sellers', data);
    return { ...response.data, role: 'seller' };
};

export const createBuyer = async (data: CreateBuyerData) => {
    const response = await api.post('/admin/buyers', data);
    return { ...response.data, role: 'buyer' };
};