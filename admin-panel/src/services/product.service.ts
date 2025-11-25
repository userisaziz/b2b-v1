import api from './api';

export const getProducts = async () => {
    const response = await api.get('/products');
    return response.data;
};

export const getProduct = async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
};

export const createProduct = async (data: any, images?: File[]) => {
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
};

export const updateProduct = async (id: string, data: any) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
};

export const deleteProduct = async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
};

export const getCategories = async () => {
    const response = await api.get('/categories');
    return response.data;
};