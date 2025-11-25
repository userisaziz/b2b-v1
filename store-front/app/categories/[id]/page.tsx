"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Grid, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCategory, getProducts, Category, Product } from "@/lib/storefront";

export default function CategoryDetailPage() {
  const params = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    loadCategoryAndProducts();
  }, [params.id]);

  const loadCategoryAndProducts = async () => {
    try {
      setLoading(true);
      setProductsLoading(true);
      
      // Load category details
      const categoryData = await getCategory(params.id as string);
      setCategory(categoryData);
      setLoading(false);

      // Load products in this category
      const productsData = await getProducts({
        category: params.id as string,
        limit: 20
      });
      setProducts(productsData.data);
    } catch (error) {
      console.error("Error loading category:", error);
    } finally {
      setLoading(false);
      setProductsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category not found</h1>
          <Link href="/categories">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Categories
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/categories">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Categories
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              ) : (
                <div className="w-24 h-24 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Grid className="h-12 w-12 text-blue-600" />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
                {category.description && (
                  <p className="text-gray-600 mb-4">{category.description}</p>
                )}
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {products.length} Products
                  </Badge>
                  {category.subcategories && category.subcategories.length > 0 && (
                    <Badge variant="secondary">
                      {category.subcategories.length} Subcategories
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subcategories */}
        {category.subcategories && category.subcategories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Subcategories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {category.subcategories.map((subcat) => (
                <Link key={subcat.id} href={`/categories/${subcat.id}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Grid className="h-6 w-6 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {subcat.name}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Products in this Category</h2>
          
          {productsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products available</h3>
                <p className="text-gray-600">Check back later for new products in this category</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="aspect-square bg-gray-200 relative">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="h-16 w-16" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                      {product.users?.company || "Seller"}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-blue-600">
                        ₹{product.price.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        MOQ: {product.min_order_quantity}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
