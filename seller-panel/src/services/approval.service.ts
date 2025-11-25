import api from './api';

// Category Change Requests
export interface CategoryChangeRequest {
  _id: string;
  sellerId: {
    _id: string;
    name: string;
    companyName: string;
    email: string;
  };
  proposedName: string;
  parentId?: {
    _id: string;
    name: string;
  };
  description?: string;
  reason: string;
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

// Category Addition Requests
export interface CategoryAdditionRequest {
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
  // Add image field
  image?: {
    url: string;
    alt: string;
  };
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

// Category Change Requests
export const createCategoryChangeRequest = async (data: {
  proposedName: string;
  parentId?: string;
  description?: string;
  reason: string;
}) => {
  const response = await api.post('/approvals/category-requests', data);
  return response.data;
};

export const getCategoryChangeRequests = async (params?: {
  status?: string;
}) => {
  const queryParams = new URLSearchParams(params as any).toString();
  const url = `/approvals/category-requests/seller${queryParams ? `?${queryParams}` : ''}`;
  const response = await api.get(url);
  return response.data;
};

// Updated Category Request Functions using the new endpoint
export const createCategoryRequest = async (data: {
  proposedName: string;
  proposedSlug: string;
  parentCategoryId?: string;
  description?: string;
  sellerReason: string;
  image?: File;
}) => {
  // If we have a file, use FormData
  if (data.image) {
    const formData = new FormData();
    
    // Append text fields
    formData.append('proposedName', data.proposedName);
    formData.append('proposedSlug', data.proposedSlug);
    if (data.parentCategoryId) formData.append('parentCategoryId', data.parentCategoryId);
    if (data.description) formData.append('description', data.description);
    formData.append('sellerReason', data.sellerReason);
    
    // Append image file
    formData.append('image', data.image);
    
    const response = await api.post('/category-requests', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } else {
    // No file, use regular JSON
    const response = await api.post('/category-requests', data);
    return response.data;
  }
};

export const getCategoryRequests = async (params?: {
  status?: string;
}) => {
  const queryParams = new URLSearchParams(params as any).toString();
  const url = `/category-requests/seller${queryParams ? `?${queryParams}` : ''}`;
  const response = await api.get(url);
  return response.data;
};

// Keep the old functions for backward compatibility (but they should be updated to use the new endpoint)
export const createCategoryAdditionRequest = async (data: {
  proposedName: string;
  parentCategoryId?: string;
  description?: string;
  reason: string;
}) => {
  const response = await api.post('/approvals/category-addition-requests', data);
  return response.data;
};

export const getCategoryAdditionRequests = async (params?: {
  status?: string;
}) => {
  const queryParams = new URLSearchParams(params as any).toString();
  const url = `/approvals/category-addition-requests/seller${queryParams ? `?${queryParams}` : ''}`;
  const response = await api.get(url);
  return response.data;
};