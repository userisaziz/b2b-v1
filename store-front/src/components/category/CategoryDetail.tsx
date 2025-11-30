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
  getAllCategories
} from '@/src/services/category.service';

interface CategoryDetailProps {
  slug: string;
}

export default function CategoryDetail({ slug }: CategoryDetailProps) {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<any[]>([]);
  const [descendants, setDescendants] = useState<Category[]>([]);
  const [siblings, setSiblings] = useState<Category[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadCategory();
  }, [slug]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get category by slug
      const categoryData = await getCategoryBySlug(slug);
      setCategory(categoryData);
      
      // Get all categories to build relationships
      const allCategories = await getAllCategories();
      
      // Get breadcrumbs
      const breadcrumbData = getCategoryBreadcrumbs(categoryData, allCategories.categoryMap);
      setBreadcrumbs(breadcrumbData);
      
      // Get descendants
      const descendantData = getCategoryDescendants(categoryData.id, allCategories.categoryMap);
      setDescendants(descendantData);
      
      // Get siblings
      const siblingData = getSiblingCategories(categoryData.id, allCategories.categoryMap);
      setSiblings(siblingData);
    } catch (err: any) {
      setError(err.message || 'Failed to load category');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categorySlug: string) => {
    router.push(`/categories/${categorySlug}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
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
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={loadCategory}>Try Again</Button>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center py-12">
        <Grid className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Category not found</h2>
        <p className="text-gray-600 mb-4">The category you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push('/categories')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm">
        <Link href="/categories" className="text-blue-600 hover:underline">
          Categories
        </Link>
        {breadcrumbs.map((breadcrumb, index) => (
          <span key={breadcrumb.id} className="flex items-center">
            <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
            {index === breadcrumbs.length - 1 ? (
              <span className="text-gray-900 font-medium">{breadcrumb.name}</span>
            ) : (
              <Link 
                href={`/categories/${breadcrumb.slug}`} 
                className="text-blue-600 hover:underline"
              >
                {breadcrumb.name}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* Category Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              {category.imageUrl ? (
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              ) : (
                <div className="w-24 h-24 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Grid className="h-12 w-12 text-blue-600" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
                <Badge variant={category.isActive ? "default" : "secondary"}>
                  {category.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              
              {category.description && (
                <p className="text-gray-600 mb-4">{category.description}</p>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-1" />
                  <span>Level {category.level}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Created {new Date(category.createdAt).toLocaleDateString()}</span>
                </div>
                {category.productCount !== undefined && category.productCount > 0 && (
                  <div className="flex items-center">
                    <Package className="h-4 w-4 mr-1" />
                    <span>{category.productCount} products</span>
                  </div>
                )}
              </div>
              
              {category.metadata?.metaDescription && (
                <p className="text-sm text-gray-500 mt-3 italic">
                  {category.metadata.metaDescription}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sibling Categories */}
      {siblings.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Related Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {siblings.map((sibling) => (
              <Card 
                key={sibling.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleCategoryClick(sibling.slug)}
              >
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Folder className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                    {sibling.name}
                  </h3>
                  {sibling.productCount !== undefined && sibling.productCount > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {sibling.productCount} products
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Subcategories */}
      {category.children && category.children.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Subcategories</h2>
            <Badge variant="secondary">
              {category.children.length} {category.children.length === 1 ? 'Category' : 'Categories'}
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {category.children.map((subcategory) => (
              <Card 
                key={subcategory.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleCategoryClick(subcategory.slug)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {subcategory.imageUrl ? (
                        <img
                          src={subcategory.imageUrl}
                          alt={subcategory.name}
                          className="w-10 h-10 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
                          <Folder className="h-5 w-5 text-blue-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate text-sm">
                        {subcategory.name}
                      </h3>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center text-xs text-gray-500">
                          {subcategory.childrenCount !== undefined && subcategory.childrenCount > 0 && (
                            <span>{subcategory.childrenCount}</span>
                          )}
                          {subcategory.productCount !== undefined && subcategory.productCount > 0 && (
                            <span className="ml-1">{subcategory.productCount} products</span>
                          )}
                        </div>
                        <ChevronRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Descendants */}
      {descendants.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">All Subcategories</h2>
            <Badge variant="secondary">
              {descendants.length} {descendants.length === 1 ? 'Category' : 'Categories'}
            </Badge>
          </div>
          <div className="overflow-hidden rounded-lg border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {descendants.map((descendant) => (
                  <tr 
                    key={descendant.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleCategoryClick(descendant.slug)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {descendant.imageUrl ? (
                            <img
                              src={descendant.imageUrl}
                              alt={descendant.name}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-blue-100 rounded-md flex items-center justify-center">
                              <Folder className="h-5 w-5 text-blue-600" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{descendant.name}</div>
                          <div className="text-sm text-gray-500">{descendant.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Level {descendant.level}</div>
                      <div className="text-sm text-gray-500">{descendant.path}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {descendant.productCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        descendant.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {descendant.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}