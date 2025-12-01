import apiClient from '@/lib/api';

// Category interfaces
export interface CategoryAncestor {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  _id: string;
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  parent_id?: string;
  level: number;
  path: string;
  ancestors?: CategoryAncestor[];
  isActive: boolean;
  displayOrder: number;
  productCount?: number;
  childrenCount?: number;
  imageUrl?: string;
  metadata?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface Breadcrumb {
  id: string;
  name: string;
  slug: string;
}

export interface CategoryTree {
  rootCategories: Category[];
  categoryMap: Record<string, Category>;
}

// Get all categories with hierarchical structure
export const getAllCategories = async (): Promise<CategoryTree> => {
  try {
    console.log('Fetching all categories');
    const response = await apiClient.get('/categories');
    const categories: Category[] = response.data;
    console.log('Categories received:', categories.length);
    
    // Build hierarchical structure
    const categoryMap: Record<string, Category> = {};
    const rootCategories: Category[] = [];
    
    // Create a map of all categories by their ID
    categories.forEach(category => {
      categoryMap[category._id] = {
        ...category,
        id: category._id,
        children: []
      };
    });
    
    // Build the tree structure
    categories.forEach(category => {
      const cat = categoryMap[category._id];
      if (category.parentId) {
        const parent = categoryMap[category.parentId];
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(cat);
        } else {
          // Parent not found, treat as root
          rootCategories.push(cat);
        }
      } else {
        // Root category
        rootCategories.push(cat);
      }
    });
    
    const result = {
      rootCategories,
      categoryMap
    };
    console.log('Categories processed:', result);
    return result;
  } catch (error: any) {
    console.error('Error fetching all categories:', error);
    throw error.response?.data || { message: 'An error occurred while fetching categories' };
  }
};

// Get category by ID with full details
export const getCategoryById = async (id: string): Promise<Category> => {
  try {
    const response = await apiClient.get(`/categories/${id}`);
    const category = response.data;
    
    // Ensure consistent ID field
    return {
      ...category,
      id: category._id
    };
  } catch (error: any) {
    throw error.response?.data || { message: 'An error occurred while fetching the category' };
  }
};

// Get category by slug
export const getCategoryBySlug = async (slug: string): Promise<Category> => {
  try {
    console.log('Fetching category by slug:', slug);
    
    // Check if the slug looks like an ID (MongoDB ObjectId format)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);
    
    let response;
    if (isObjectId) {
      // If it looks like an ID, try fetching by ID first
      try {
        response = await apiClient.get(`/categories/${slug}`);
      } catch (idError: any) {
        // If ID fetch fails, fall back to slug fetch
        if (idError.response?.status === 404) {
          response = await apiClient.get(`/categories/slug/${slug}`);
        } else {
          throw idError;
        }
      }
    } else {
      // Otherwise, fetch by slug
      response = await apiClient.get(`/categories/slug/${slug}`);
    }
    
    console.log('API response for category:', response.data);
    const category = response.data;
    
    // Ensure consistent ID field
    const transformedCategory = {
      ...category,
      id: category._id
    };
    console.log('Transformed category:', transformedCategory);
    return transformedCategory;
  } catch (error: any) {
    console.error('Error fetching category by slug:', slug, error);
    // Handle 404 errors specifically
    if (error.response?.status === 404) {
      throw new Error('Category not found');
    }
    throw error.response?.data || { message: 'An error occurred while fetching the category' };
  }
};

// Get category by slug with products
export const getCategoryBySlugWithProducts = async (slug: string): Promise<any> => {
  try {
    // Check if the slug looks like an ID (MongoDB ObjectId format)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);
    
    let response;
    if (isObjectId) {
      // If it looks like an ID, try fetching by ID first
      try {
        response = await apiClient.get(`/categories/${slug}/products`);
      } catch (idError: any) {
        // If ID fetch fails, fall back to slug fetch
        if (idError.response?.status === 404) {
          response = await apiClient.get(`/categories/slug/${slug}/products`);
        } else {
          throw idError;
        }
      }
    } else {
      // Otherwise, fetch by slug
      response = await apiClient.get(`/categories/slug/${slug}/products`);
    }
    
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'An error occurred while fetching the category with products' };
  }
};

// Get products for a category
export const getCategoryProducts = async (categoryId: string, params?: {
  page?: number;
  limit?: number;
  sort?: string;
}): Promise<any> => {
  try {
    const response = await apiClient.get(`/categories/${categoryId}/products`, { params });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: 'An error occurred while fetching category products' };
  }
};

// Search categories by name
export const searchCategories = async (searchTerm: string): Promise<Category[]> => {
  try {
    const allCategories = await getAllCategories();
    const searchTermLower = searchTerm.toLowerCase();
    
    return Object.values(allCategories.categoryMap).filter(category => 
      category.name.toLowerCase().includes(searchTermLower) ||
      (category.description && category.description.toLowerCase().includes(searchTermLower))
    );
  } catch (error: any) {
    throw error.response?.data || { message: 'An error occurred while searching categories' };
  }
};

// Get breadcrumbs for a category
export const getCategoryBreadcrumbs = (category: Category, categoryMap: Record<string, Category>): Breadcrumb[] => {
  const breadcrumbs: Breadcrumb[] = [];
  
  // Add ancestors in reverse order (from root to parent)
  if (category.ancestors) {
    category.ancestors.forEach(ancestor => {
      breadcrumbs.push({
        id: ancestor.id,
        name: ancestor.name,
        slug: ancestor.slug
      });
    });
  }
  
  // Add current category
  breadcrumbs.push({
    id: category.id,
    name: category.name,
    slug: category.slug
  });
  
  return breadcrumbs;
};

// Get all descendants of a category
export const getCategoryDescendants = (categoryId: string, categoryMap: Record<string, Category>): Category[] => {
  const descendants: Category[] = [];
  
  const findDescendants = (id: string) => {
    Object.values(categoryMap).forEach(category => {
      if (category.parentId === id) {
        descendants.push(category);
        findDescendants(category.id);
      }
    });
  };
  
  findDescendants(categoryId);
  return descendants;
};

// Get sibling categories (categories with the same parent)
export const getSiblingCategories = (categoryId: string, categoryMap: Record<string, Category>): Category[] => {
  const category = categoryMap[categoryId];
  if (!category) return [];
  
  const parentId = category.parentId || null;
  
  return Object.values(categoryMap).filter(cat => 
    cat.id !== categoryId && cat.parentId === parentId
  );
};

// Generate slug from name
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Validate category data
export const validateCategory = (category: Partial<Category>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!category.name || category.name.trim().length === 0) {
    errors.push('Category name is required');
  }
  
  if (category.name && category.name.length > 255) {
    errors.push('Category name must be less than 255 characters');
  }
  
  if (category.description && category.description.length > 1000) {
    errors.push('Category description must be less than 1000 characters');
  }
  
  if (category.slug && category.slug.length > 255) {
    errors.push('Category slug must be less than 255 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};