import apiClient from './api';

// Product interfaces
export interface Product {
  id: string;
  seller_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  min_order_quantity: number;
  images: string[];
  specifications: Record<string, any>;
  status: string;
  created_at: string;
  updated_at: string;
  categories?: { name: string };
  category?: { id: string; name: string };
  users?: { name: string; company: string; email: string; phone?: string };
}

// Category interface
export interface Category {
  id: string;
  name: string;
  description: string;
  parent_id: string | null;
  image: string | null;
  created_at: string;
  updated_at: string;
  subcategories?: Category[];
}

// RFQ interface
export interface RFQ {
  id: string;
  buyer_id: string;
  category_id: string;
  title: string;
  description: string;
  quantity?: number;
  budget_min?: number;
  budget_max?: number;
  deadline?: string;
  delivery_location?: string;
  status: 'open' | 'closed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// Seller interface
export interface Seller {
  id: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
}

// Get all products
export const getProducts = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  seller_id?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
}): Promise<{ data: Product[]; pagination: any }> => {
  const response = await apiClient.get('/public/products', { params });
  return {
    data: response.data.data,
    pagination: response.data.pagination
  };
};

// Get single product
export const getProduct = async (id: string): Promise<Product> => {
  const response = await apiClient.get(`/public/products/${id}`);
  return response.data.data;
};

// Alias for getProduct
export const getProductById = getProduct;

// Message interface
export interface SendMessageData {
  recipient_id: string;
  subject: string;
  message: string;
  message_type?: 'general' | 'product_inquiry' | 'support' | 'rfq';
}

// Send message
export const sendMessage = async (data: SendMessageData): Promise<any> => {
  const response = await apiClient.post('/messages', data);
  return response.data.data;
};

// Get all categories
export const getCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get('/public/categories');
  return response.data.data;
};

// Get category by ID
export const getCategory = async (id: string): Promise<Category> => {
  const response = await apiClient.get(`/public/categories/${id}`);
  return response.data.data;
};

// Post RFQ
export const postRFQ = async (data: Partial<RFQ>): Promise<RFQ> => {
  const response = await apiClient.post('/public/rfq', data);
  return response.data.data;
};

// Get sellers
export const getSellers = async (category_id?: string): Promise<Seller[]> => {
  const response = await apiClient.get('/public/sellers', {
    params: category_id ? { category_id } : undefined
  });
  return response.data.data;
};

// Track product view (authenticated users)
export const trackProductView = async (productId: string): Promise<void> => {
  try {
    await apiClient.post(`/public/products/${productId}/view`);
  } catch (error) {
    // Silently fail if not authenticated
    console.log('Product view tracking skipped (not authenticated)');
  }
};

// Track catalogue visit (authenticated users)
export const trackCatalogueView = async (sellerId: string): Promise<void> => {
  try {
    await apiClient.post('/public/catalogue/view', { seller_id: sellerId });
  } catch (error) {
    // Silently fail if not authenticated
    console.log('Catalogue view tracking skipped (not authenticated)');
  }
};
