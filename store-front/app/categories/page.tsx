"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Grid } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getCategories, Category } from "@/lib/storefront";
import StorefrontLayout from "@/components/layout/StorefrontLayout";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  };

  // Build hierarchical tree
  const buildTree = (categories: Category[], parentId: string | null = null): Category[] => {
    return categories
      .filter(cat => cat.parent_id === parentId)
      .map(cat => ({
        ...cat,
        subcategories: buildTree(categories, cat.id)
      }));
  };

  const categoryTree = buildTree(categories);

  const CategoryCard = ({ category }: { category: Category }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <Link href={`/categories/${category.id}`}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              ) : (
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Grid className="h-8 w-8 text-blue-600" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                {category.name}
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </h3>
              {category.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {category.description}
                </p>
              )}
              {category.subcategories && category.subcategories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {category.subcategories.slice(0, 3).map(sub => (
                    <span
                      key={sub.id}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                    >
                      {sub.name}
                    </span>
                  ))}
                  {category.subcategories.length > 3 && (
                    <span className="text-xs text-gray-500 px-2 py-1">
                      +{category.subcategories.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );

  return (
    <StorefrontLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse by Category</h2>
          <p className="text-gray-600">
            Explore our wide range of product categories and find what you need
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading categories...</p>
          </div>
        ) : categoryTree.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Grid className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories available</h3>
              <p className="text-gray-600">Check back later for new categories</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryTree.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
}
