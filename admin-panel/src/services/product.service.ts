import api from './api';

export const getProducts = async () => {
    try {
        const response = await api.get('/products');
        // Handle both direct array and paginated response formats
        if (Array.isArray(response.data)) {
            return response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
            return response.data.data;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        return []; // Return empty array on error
    }
};

export const getProduct = async (id: string) => {
    try {
        const response = await api.get(`/products/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching product ${id}:`, error);
        throw error; // Re-throw to be handled by caller
    }
};

export const createProduct = async (data: any, images?: File[]) => {
    try {
        // If we have files, use FormData
        if (images && images.length > 0) {
            const formData = new FormData();
            
            // Append product data as JSON string
            formData.append('data', JSON.stringify(data));
            
            // Append image files
            images.forEach((image) => {
                formData.append('images', image);
            });
            
            // Extract image URLs from data and add them separately
            if (data.images && data.images.length > 0) {
                const imageUrls = data.images
                    .filter((img: any) => typeof img === 'string' && img.startsWith('http'))
                    .map((img: string) => img);
                
                if (imageUrls.length > 0) {
                    // Add image URLs as a JSON array
                    formData.append('imageUrls', JSON.stringify(imageUrls));
                }
            }
            
            const response = await api.post('/products', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            return response.data;
        } else {
            // No files, use regular JSON
            const response = await api.post('/products', data);
            return response.data;
        }
    } catch (error) {
        console.error('Error creating product:', error);
        throw error; // Re-throw to be handled by caller
    }
};

export const updateProduct = async (id: string, data: any) => {
    try {
        const response = await api.put(`/products/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Error updating product ${id}:`, error);
        throw error; // Re-throw to be handled by caller
    }
};

export const deleteProduct = async (id: string) => {
    try {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting product ${id}:`, error);
        throw error; // Re-throw to be handled by caller
    }
};

export const getCategories = async () => {
    try {
        const response = await api.get('/categories');
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return []; // Return empty array on error
    }
};