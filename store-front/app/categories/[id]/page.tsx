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
import StorefrontLayout from "@/components/layout/StorefrontLayout";

export default function CategoryDetailPage() {
  console.log('CategoryDetailPage rendered');
  const params = useParams();
  console.log('Params:', params);
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useEffect triggered with params.id:', params.id);
    if (params.id && params.id !== 'undefined') {
      console.log('Loading category with slug:', params.id);
      loadCategory(params.id as string);
    } else {
      console.log('Invalid category slug');
      setError('Invalid category');
      setLoading(false);
    }
  }, [params.id]);

  const loadCategory = async (slug: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching category by slug:', slug);
      const data = await getCategoryBySlug(slug);
      console.log('Category data received:', data);
      setCategory(data);
    } catch (err: any) {
      console.error('Error loading category:', err);
      setError(err.message || 'Failed to load category');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StorefrontLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-32 bg-gray-200 rounded-lg"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </StorefrontLayout>
    );
  }

  if (error) {
    return (
      <StorefrontLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="mx-auto h-12 w-12 text-red-500 mb-4">
                <Folder className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Category</h3>
              <p className="text-gray-500 mb-6">{error}</p>
              <div className="flex justify-center gap-3">
                <Button onClick={() => router.back()}>
                  Go Back
                </Button>
                <Button variant="outline" onClick={() => router.refresh()}>
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </StorefrontLayout>
    );
  }

  if (!category) {
    return (
      <StorefrontLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <Folder className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Category Not Found</h3>
              <p className="text-gray-500 mb-6">The category you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => router.push('/')}>
                Browse Categories
              </Button>
            </div>
          </div>
        </div>
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          {/* Category Detail Component */}
          <CategoryDetail slug={params.id as string} />
        </div>
      </div>
    </StorefrontLayout>
  );
}