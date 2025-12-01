import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Grid, 
  Package, 
  ChevronRight, 
  Folder,
  Calendar,
  Tag,
  Layers,
  TrendingUp,
  ShoppingCart
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
          <div className="h-48 bg-gray-200 rounded-xl mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <Package className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Category</h3>
        <p className="text-gray-600 text-center mb-6 max-w-md">{error}</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
          <Button onClick={() => router.refresh()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Folder className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Category Not Found</h3>
        <p className="text-gray-600 text-center mb-6 max-w-md">The category you're looking for doesn't exist.</p>
        <Button onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm">
        <Link href="/" className="text-gray-500 hover:text-blue-600 transition-colors">Home</Link>
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.id} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
            {index === breadcrumbs.length - 1 ? (
              <span className="text-gray-900 font-medium">{crumb.name}</span>
            ) : (
              <Link href={`/categories/${crumb.slug}`} className="text-gray-500 hover:text-blue-600 transition-colors">
                {crumb.name}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Category Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Folder className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">{category.name}</h1>
            </div>
            {category.description && (
              <p className="text-gray-700 text-lg max-w-3xl leading-relaxed">
                {category.description}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Products</p>
                  <p className="text-xl font-bold text-gray-900">{category.productCount || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-500" />
                <div>
                  <p className="text-sm text-gray-500">Subcategories</p>
                  <p className="text-xl font-bold text-gray-900">{category.childrenCount || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subcategories */}
      {(descendants.length > 0 || siblings.length > 0) && (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {category.parentId ? 'Related Categories' : 'Subcategories'}
            </h2>
            <Badge variant="secondary" className="text-sm py-1 px-3">
              {descendants.length > 0 ? descendants.length : siblings.length} categories
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {descendants.length > 0 ? (
              descendants.map((subCategory) => (
                <Card 
                  key={subCategory.id} 
                  className="hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 rounded-xl overflow-hidden group"
                  onClick={() => handleCategoryClick(subCategory.slug)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-colors">
                        <Folder className="h-6 w-6 text-gray-500 group-hover:text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {subCategory.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            {subCategory.productCount || 0}
                          </span>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Layers className="h-4 w-4" />
                            {subCategory.childrenCount || 0}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              siblings.map((siblingCategory) => (
                <Card 
                  key={siblingCategory.id} 
                  className="hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 rounded-xl overflow-hidden group"
                  onClick={() => handleCategoryClick(siblingCategory.slug)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-colors">
                        <Folder className="h-6 w-6 text-gray-500 group-hover:text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {siblingCategory.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            {siblingCategory.productCount || 0}
                          </span>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Layers className="h-4 w-4" />
                            {siblingCategory.childrenCount || 0}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>
      )}

      {/* Products Section */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Products in {category.name}
            </h2>
            <p className="text-gray-600 mt-1">Discover the latest products in this category</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Grid className="h-4 w-4" />
            View All Products
          </Button>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl h-52 mb-4"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
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
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 group"
              >
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                      <Package className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-gray-700">
                    MOQ: {product.min_order_quantity || 1}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-gray-900">
                      ₹{product.price.toLocaleString()}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Updated recently</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>{Math.floor(Math.random() * 100) + 1} sold</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 max-w-md mx-auto">There are no products in this category yet. Check back later for new arrivals.</p>
          </div>
        )}
      </section>
    </div>
  );
}