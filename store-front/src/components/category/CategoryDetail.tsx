import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Grid, 
  Package, 
  ChevronRight, 
  Folder,
  Calendar,
  Tag
} from 'lucide-react';
import { 
  getCategoryBySlug, 
  Category, 
  getCategoryBreadcrumbs, 
  getCategoryDescendants,
  getSiblingCategories,
  getAllCategories,
  getCategoryProducts
} from '@/src/services/category.service';
import { getProducts, Product } from '@/lib/storefront';

interface CategoryDetailProps {
  slug: string;
}

export default function CategoryDetail({ slug }: CategoryDetailProps) {
  console.log('CategoryDetail component rendered with slug:', slug);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<any[]>([]);
  const [descendants, setDescendants] = useState<Category[]>([]);
  const [siblings, setSiblings] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('CategoryDetail useEffect triggered with slug:', slug);
    if (slug) {
      loadCategory();
    }
  }, [slug]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading category with slug:', slug);
      
      // Get category by slug
      const categoryData = await getCategoryBySlug(slug);
      console.log('Category data received:', categoryData);
      setCategory(categoryData);
      
      // Get all categories to build relationships
      const allCategories = await getAllCategories();
      console.log('All categories loaded:', allCategories);
      
      // Get breadcrumbs
      const breadcrumbData = getCategoryBreadcrumbs(categoryData, allCategories.categoryMap);
      console.log('Breadcrumb data:', breadcrumbData);
      setBreadcrumbs(breadcrumbData);
      
      // Get descendants
      const descendantData = getCategoryDescendants(categoryData.id, allCategories.categoryMap);
      console.log('Descendant data:', descendantData);
      setDescendants(descendantData);
      
      // Get siblings
      const siblingData = getSiblingCategories(categoryData.id, allCategories.categoryMap);
      console.log('Sibling data:', siblingData);
      setSiblings(siblingData);
      
      // Load products for this category
      loadProducts(categoryData.id);
    } catch (err: any) {
      console.error('Error loading category:', err);
      setError(err.message || 'Failed to load category');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (categoryId: string) => {
    try {
      console.log('Loading products for category:', categoryId);
      setProductsLoading(true);
      const response = await getCategoryProducts(categoryId, { limit: 20 });
      console.log('Products loaded:', response.data.length);
      setProducts(response.data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleCategoryClick = (categorySlug: string) => {
    router.push(`/categories/${categorySlug}`);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-red-500 mb-4">
          <Package className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Category</h3>
        <p className="text-gray-500 text-center mb-4">{error}</p>
        <Button onClick={() => router.refresh()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-gray-400 mb-4">
          <Folder className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Category Not Found</h3>
        <p className="text-gray-500 text-center mb-4">The category you're looking for doesn't exist.</p>
        <Button onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.id} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-2" />
            {index === breadcrumbs.length - 1 ? (
              <span className="text-gray-900 font-medium">{crumb.name}</span>
            ) : (
              <Link href={`/categories/${crumb.slug}`} className="hover:text-gray-700">
                {crumb.name}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Category Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
            {category.description && (
              <p className="text-gray-600 max-w-2xl">{category.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">
              {category.productCount || 0} {category.productCount === 1 ? 'Product' : 'Products'}
            </span>
          </div>
        </div>
      </div>

      {/* Subcategories */}
      {(descendants.length > 0 || siblings.length > 0) && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {category.parentId ? 'Related Categories' : 'Subcategories'}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {descendants.length > 0 ? (
              descendants.map((subCategory) => (
                <Card 
                  key={subCategory.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
                  onClick={() => handleCategoryClick(subCategory.slug)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 rounded-lg p-2">
                        <Folder className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{subCategory.name}</h3>
                        <p className="text-sm text-gray-500">
                          {subCategory.productCount || 0} products
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              siblings.map((siblingCategory) => (
                <Card 
                  key={siblingCategory.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
                  onClick={() => handleCategoryClick(siblingCategory.slug)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 rounded-lg p-2">
                        <Folder className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{siblingCategory.name}</h3>
                        <p className="text-sm text-gray-500">
                          {siblingCategory.productCount || 0} products
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>
      )}

      {/* Products Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Products in {category.name}
          </h2>
          <Button variant="outline" size="sm">
            <Grid className="h-4 w-4 mr-2" />
            View All
          </Button>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Filter out products with undefined IDs */}
            {products.filter(product => product._id && product._id !== 'undefined').map((product) => (
              <Link 
                key={product._id} 
                href={`/products/${product._id}`}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="aspect-video bg-gray-100 relative">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      ₹{product.price}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      MOQ: {product.min_order_quantity || 1}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>In Stock</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <span>{product.stock} units</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
            <p className="text-gray-500">There are no products in this category yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}