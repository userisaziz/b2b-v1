import apiClient from './api';

// Product interfaces
export interface Product {
  _id: string;
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
  sku?: string;
  created_at: string;
  updated_at: string;
  categories?: { name: string };
  category?: { id: string; name: string };
  users?: { name: string; company: string; email: string; phone?: string };
}

// Category interface
export interface Category {
  _id: string;
  name: string;
  description: string;
  parent_id: string | null;
  image: string | null;
  created_at: string;
  updated_at: string;
  subcategories?: Category[];
  productCount?: number; // Add product count property
}

// RFQ interface
export interface RFQ {
  id: string;
  buyer_id?: string;
  category_id?: string;
  title: string;
  description: string;
  quantity?: number;
  budget_min?: number;
  budget_max?: number;
  deadline?: string;
  delivery_location?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  status: 'draft' | 'open' | 'closed' | 'cancelled';
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
  const response = await apiClient.get('/products', { params });
  
  // Transform products to ensure consistent properties
  let products = response.data.data || response.data;
  if (Array.isArray(products)) {
    products = products.map(product => {
      // Extract seller ID correctly - if sellerId is an object, get its _id, otherwise use as-is
      let sellerId = product.seller_id || product.sellerId;
      if (sellerId && typeof sellerId === 'object' && sellerId._id) {
        sellerId = sellerId._id;
      }
      
      return {
        ...product,
        _id: product._id || product.id, // Ensure _id is present
        id: product.id || product._id, // Ensure id is present
        seller_id: sellerId,
        category_id: product.category_id || (product.category ? product.category.id || product.category._id : undefined),
        min_order_quantity: product.min_order_quantity || 1,
        sku: product.sku || product.SKU,
        specifications: product.specifications || {}
      };
    });
  }
  
  return {
    data: products,
    pagination: response.data.pagination || { page: 1, limit: products.length, total: products.length }
  };
};

// Get single product
export const getProduct = async (id: string): Promise<Product> => {
  // Validate the ID format before making the request
  if (!id || id === 'undefined') {
    throw new Error('Invalid product ID');
  }
  
  const response = await apiClient.get(`/products/${id}`);
  
  // Transform product to ensure consistent properties
  const product = response.data;
  
  // Extract seller ID correctly - if sellerId is an object, get its _id, otherwise use as-is
  let sellerId = product.seller_id || product.sellerId;
  if (sellerId && typeof sellerId === 'object' && sellerId._id) {
    sellerId = sellerId._id;
  }
  
  return {
    ...product,
    _id: product._id || product.id, // Ensure _id is present
    id: product.id || product._id, // Ensure id is present
    seller_id: sellerId,
    category_id: product.category_id || (product.category ? product.category.id || product.category._id : undefined),
    min_order_quantity: product.min_order_quantity || 1,
    sku: product.sku || product.SKU,
    specifications: product.specifications || {}
  };
};

// Alias for getProduct
export const getProductById = getProduct;

// Message interface
export interface SendMessageData {
  recipient_id: string;
  subject: string;
  message: string;
  message_type?: 'general' | 'product_inquiry' | 'support' | 'rfq';
  recipient_type?: 'Buyer' | 'Seller';
}

// Send message
export const sendMessage = async (data: SendMessageData): Promise<any> => {
  // Determine recipient type based on current user role or default to Seller
  const recipientType = data.recipient_type || 'Seller';
  
  const requestData = {
    ...data,
    recipient_type: recipientType
  };
  
  const response = await apiClient.post('/messages/send', requestData);
  return response.data;
};

// Get all categories
export const getCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get('/categories');
  
  // Transform categories to map _id to id
  let categories = response.data;
  if (Array.isArray(categories)) {
    categories = categories.map(category => ({
      ...category,
      id: category.id || category._id,
      parent_id: category.parent_id || category.parentId || null
    }));
  }
  
  return categories;
};

// Get category by ID
export const getCategory = async (id: string): Promise<Category> => {
  const response = await apiClient.get(`/categories/${id}`);
  
  // Transform category to map _id to id
  const category = response.data;
  return {
    ...category,
    id: category.id || category._id,
    parent_id: category.parent_id || category.parentId || null
  };
};

// Post RFQ
export const postRFQ = async (data: Partial<RFQ>): Promise<RFQ> => {
  const response = await apiClient.post('/rfqs/public', data);
  return response.data.data;
};

// Get sellers
export const getSellers = async (category_id?: string): Promise<Seller[]> => {
  const response = await apiClient.get('/sellers', {
    params: category_id ? { category_id } : undefined
  });
  return response.data;
};

// Track product view (authenticated users)
export const trackProductView = async (productId: string): Promise<void> => {
  try {
    await apiClient.post(`/products/${productId}/view`);
  } catch (error) {
    // Silently fail if not authenticated
    console.log('Product view tracking skipped (not authenticated)');
  }
};

// Track catalogue visit (authenticated users)
export const trackCatalogueView = async (sellerId: string): Promise<void> => {
  try {
    await apiClient.post('/catalogue/view', { seller_id: sellerId });
  } catch (error) {
    // Silently fail if not authenticated
    console.log('Catalogue view tracking skipped (not authenticated)');
  }
};
