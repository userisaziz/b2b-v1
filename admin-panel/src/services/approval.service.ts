import api from './api';

// Product Approval Requests
export interface ProductApprovalRequest {
  _id: string;
  productId: {
    _id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    status: string;
  };
  sellerId: {
    _id: string;
    name: string;
    companyName: string;
    email: string;
  };
  requestType: 'new' | 'modification';
  changes: any;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Category Requests
export interface CategoryRequest {
  _id: string;
  sellerId: {
    _id: string;
    name: string;
    companyName: string;
    email: string;
  };
  proposedName: string;
  proposedSlug: string;
  parentCategoryId?: {
    _id: string;
    name: string;
  };
  parentCategoryName?: string;
  parentCategoryPath?: string;
  description?: string;
  sellerReason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reviewedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  reviewedAt?: string;
  adminNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Seller Approval
export interface SellerApproval {
  _id: string;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  businessType: string;
  crNumber?: string;
  taxNumber?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  approvedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  approvedAt?: string;
  rejectionReason?: string;
  rejectedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Product Approval Requests
export const getProductApprovalRequests = async (params?: {
  status?: string;
  sellerId?: string;
  requestType?: string;
}) => {
  const queryParams = new URLSearchParams(params as any).toString();
  const url = `/approvals/product-requests${queryParams ? `?${queryParams}` : ''}`;
  const response = await api.get(url);
  return response.data;
};

export const getProductApprovalRequest = async (id: string) => {
  const response = await api.get(`/approvals/product-requests/${id}`);
  return response.data;
};

export const approveProductApprovalRequest = async (id: string) => {
  const response = await api.patch(`/approvals/product-requests/${id}/approve`);
  return response.data;
};

export const rejectProductApprovalRequest = async (id: string, rejectionReason: string) => {
  const response = await api.patch(`/approvals/product-requests/${id}/reject`, { rejectionReason });
  return response.data;
};

// Category Requests
export const getCategoryRequests = async (params?: {
  status?: string;
  sellerId?: string;
}) => {
  const queryParams = new URLSearchParams(params as any).toString();
  const url = `/category-requests${queryParams ? `?${queryParams}` : ''}`;
  const response = await api.get(url);
  return response.data;
};

export const getCategoryRequest = async (id: string) => {
  const response = await api.get(`/category-requests/${id}`);
  return response.data;
};

export const approveCategoryRequest = async (id: string) => {
  const response = await api.patch(`/category-requests/${id}/approve`);
  return response.data;
};

export const rejectCategoryRequest = async (id: string, rejectionReason: string) => {
  const response = await api.patch(`/category-requests/${id}/reject`, { rejectionReason });
  return response.data;
};

// Seller Approvals
export const getSellerApprovals = async (params?: {
  status?: 'pending' | 'approved' | 'rejected' | 'suspended';
}) => {
  const queryParams = new URLSearchParams(params as any).toString();
  const url = `/approvals/sellers${queryParams ? `?${queryParams}` : ''}`;
  const response = await api.get(url);
  return response.data;
};

export const getSellerApproval = async (id: string) => {
  const response = await api.get(`/approvals/sellers/${id}`);
  return response.data;
};

export const approveSeller = async (id: string) => {
  const response = await api.patch(`/approvals/sellers/${id}/approve`);
  return response.data;
};

export const rejectSeller = async (id: string, rejectionReason: string) => {
  const response = await api.patch(`/approvals/sellers/${id}/reject`, { rejectionReason });
  return response.data;
};

export const suspendSeller = async (id: string) => {
  const response = await api.patch(`/approvals/sellers/${id}/suspend`);
  return response.data;
};