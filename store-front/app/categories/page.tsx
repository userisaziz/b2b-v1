"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Grid, ChevronRight, Folder } from 'lucide-react';
import Link from "next/link";
import { getAllCategories, Category, CategoryTree, searchCategories } from "@/src/services/category.service";
import StorefrontLayout from "@/components/layout/StorefrontLayout";

export default function CategoriesPage() {
  const [categoryTree, setCategoryTree] = useState<CategoryTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (categoryTree) {
      if (searchTerm.trim()) {
        // Filter categories based on search term
        const filtered = Object.values(categoryTree.categoryMap).filter(category => 
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredCategories(filtered);
      } else {
        // Show root categories when no search term
        setFilteredCategories(categoryTree.rootCategories);
      }
    }
  }, [searchTerm, categoryTree]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      setCategoryTree(data);
      setFilteredCategories(data.rootCategories);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      try {
        const results = await searchCategories(term);
        setFilteredCategories(results);
      } catch (err) {
        console.error('Search error:', err);
      }
    } else if (categoryTree) {
      setFilteredCategories(categoryTree.rootCategories);
    }
  };

  if (loading) {
    return (
      <StorefrontLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
            </div>
            
            <div className="relative mb-8">
              <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
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
            <div className="text-center py-12">
              <Grid className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Categories</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <button 
                onClick={loadCategories}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
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
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Categories</h1>
            <p className="text-gray-600">
              Explore our wide range of product categories and find what you need
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8 max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-3 w-full text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Breadcrumb for search results */}
          {searchTerm && (
            <div className="mb-6 text-sm text-gray-600">
              Search results for "<span className="font-medium">{searchTerm}</span>" 
              <span className="ml-2">({filteredCategories.length} categories found)</span>
            </div>
          )}

          {/* Categories Grid */}
          {filteredCategories.length === 0 ? (
            <div className="text-center py-16">
              <Grid className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Categories Found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? 'No categories match your search criteria.' : 'There are no categories available at the moment.'}
              </p>
              {searchTerm && (
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setFilteredCategories(categoryTree?.rootCategories || []);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {searchTerm ? 'Search Results' : 'Top Categories'}
                </h2>
                <span className="text-sm text-gray-500">
                  {filteredCategories.length} {filteredCategories.length === 1 ? 'Category' : 'Categories'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCategories.map((category) => (
                  <Link 
                    key={category.id} 
                    href={`/categories/${category.slug}`}
                    className="group"
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-200 border border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            {category.imageUrl ? (
                              <img
                                src={category.imageUrl}
                                alt={category.name}
                                className="w-16 h-16 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Folder className="h-8 w-8 text-blue-600" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                              {category.name}
                            </h3>
                            
                            {category.description && (
                              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                                {category.description}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center text-xs text-gray-500">
                                {category.childrenCount !== undefined && category.childrenCount > 0 && (
                                  <span>{category.childrenCount} subcategories</span>
                                )}
                                {(category.productCount !== undefined && category.productCount > 0) && (
                                  <span className={category.childrenCount !== undefined && category.childrenCount > 0 ? "ml-2" : ""}>
                                    {category.productCount} products
                                  </span>
                                )}
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </StorefrontLayout>
  );
}