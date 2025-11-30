"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Grid, 
  Package, 
  ChevronRight, 
  Folder,
  Calendar,
  Tag,
  Search
} from "lucide-react";
import CategoryDetail from "@/src/components/category/CategoryDetail";
import CategorySearch from "@/src/components/category/CategorySearch";
import { getCategoryBySlug, Category } from "@/src/services/category.service";

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadCategory(params.id as string);
    }
  }, [params.id]);

  const loadCategory = async (slug: string) => {
    try {
      setLoading(true);
      setError(null);
      const categoryData = await getCategoryBySlug(slug);
      setCategory(categoryData);
    } catch (err: any) {
      setError(err.message || 'Category not found');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (selectedCategory: Category) => {
    router.push(`/categories/${selectedCategory.slug}`);
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Grid className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category not found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => router.push('/categories')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Categories
            </Button>
            <div className="relative max-w-md mx-auto">
              <CategorySearch onCategorySelect={handleCategorySelect} />
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
      {/* Header with search */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Link href="/categories">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Categories
              </Button>
            </Link>
            <div className="relative max-w-md w-full">
              <CategorySearch onCategorySelect={handleCategorySelect} />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CategoryDetail slug={params.id as string} />
      </div>
    </div>
  );
}