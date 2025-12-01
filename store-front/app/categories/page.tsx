"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Grid, ChevronRight, Folder, Package, TrendingUp, Award, Users, Layers, Grid3x3 } from 'lucide-react';
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

  // Statistics section component
  const StatisticsSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center">
          <div className="p-3 bg-white/20 rounded-lg">
            <Package className="h-8 w-8" />
          </div>
          <div className="ml-4">
            <p className="text-sm opacity-80">Total Products</p>
            <p className="text-2xl font-bold">10,000+</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center">
          <div className="p-3 bg-white/20 rounded-lg">
            <Users className="h-8 w-8" />
          </div>
          <div className="ml-4">
            <p className="text-sm opacity-80">Active Sellers</p>
            <p className="text-2xl font-bold">1,200+</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center">
          <div className="p-3 bg-white/20 rounded-lg">
            <Award className="h-8 w-8" />
          </div>
          <div className="ml-4">
            <p className="text-sm opacity-80">Verified Suppliers</p>
            <p className="text-2xl font-bold">95%</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Bento Grid Category Component
  const BentoGridCategory = ({ category, index }: { category: Category; index: number }) => {
    const subcategories = category.children || [];
    const hasSubcategories = subcategories.length > 0;
    
    return (
      <div 
        key={category.id} 
        className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group ${
          index === 0 ? 'md:col-span-2 md:row-span-2' : ''
        }`}
      >
        <Link href={`/categories/${category.slug}`} className="block h-full">
          <div className={`p-6 ${index === 0 ? 'pb-4' : ''}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Grid3x3 className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-lg">
                  {category.name}
                </h3>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
            
            {category.description && (
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                {category.description}
              </p>
            )}
            
            <div className="flex items-center gap-2 mb-4">
              {category.productCount !== undefined && category.productCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  <Package className="h-3 w-3" />
                  {category.productCount} products
                </span>
              )}
              
              {category.childrenCount !== undefined && category.childrenCount > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                  <Layers className="h-3 w-3" />
                  {category.childrenCount} subcategories
                </span>
              )}
            </div>
            
            {hasSubcategories && (
              <div className={`mt-4 pt-4 border-t border-gray-100 ${index === 0 ? '' : 'hidden md:block'}`}>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Layers className="h-3 w-3" />
                  Subcategories
                </h4>
                <div className={`space-y-2 ${index === 0 ? '' : 'hidden md:block'}`}>
                  {subcategories.slice(0, index === 0 ? 5 : 3).map((subcat) => (
                    <div key={subcat.id} className="flex items-center justify-between group/subcat">
                      <span className="text-sm text-gray-700 group-hover/subcat:text-blue-600 transition-colors">
                        {subcat.name}
                      </span>
                      {subcat.productCount !== undefined && subcat.productCount > 0 && (
                        <span className="text-xs text-gray-400">
                          {subcat.productCount}
                        </span>
                      )}
                    </div>
                  ))}
                  {subcategories.length > (index === 0 ? 5 : 3) && (
                    <div className="text-xs text-blue-600 font-medium">
                      +{subcategories.length - (index === 0 ? 5 : 3)} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Link>
      </div>
    );
  };

  if (loading) {
    return (
      <StorefrontLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header skeleton */}
            <div className="mb-12 text-center">
              <div className="h-10 bg-gray-200 rounded w-1/2 mx-auto mb-4 animate-pulse"></div>
              <div className="h-5 bg-gray-200 rounded w-1/3 mx-auto animate-pulse"></div>
            </div>
            
            {/* Stats skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
              ))}
            </div>
            
            {/* Search bar skeleton */}
            <div className="relative mb-12 max-w-2xl mx-auto">
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            
            {/* Categories bento grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                      </div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </div>
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
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="max-w-md mx-auto text-center bg-white rounded-2xl shadow-xl p-8">
              <Grid className="h-16 w-16 text-red-500 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-gray-900 mb-3">Error Loading Categories</h1>
              <p className="text-gray-600 mb-8">{error}</p>
              <button 
                onClick={loadCategories}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Browse Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Product Categories</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover thousands of products across hundreds of categories from verified suppliers worldwide
            </p>
          </div>
          
          {/* Statistics Section */}
          <StatisticsSection />
          
          {/* Search Bar */}
          <div className="relative mb-12 max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 pr-6 py-4 w-full text-base border-0 rounded-2xl shadow-lg focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all"
            />
          </div>
          
          {/* Breadcrumb for search results */}
          {searchTerm && (
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-2 shadow-sm border border-gray-100">
                <span className="text-gray-600">Search results for</span>
                <span className="font-semibold text-blue-600">"{searchTerm}"</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{filteredCategories.length} categories found</span>
              </div>
            </div>
          )}
          
          {/* Categories Bento Grid */}
          {filteredCategories.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <Grid className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">No Categories Found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm ? 'No categories match your search criteria.' : 'There are no categories available at the moment.'}
              </p>
              {searchTerm && (
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setFilteredCategories(categoryTree?.rootCategories || []);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {searchTerm ? 'Search Results' : 'All Categories'}
                </h2>
                <span className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-1.5 text-sm font-medium text-gray-600 shadow-sm border border-gray-100">
                  <span>{filteredCategories.length}</span>
                  <span>{filteredCategories.length === 1 ? 'Category' : 'Categories'}</span>
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {filteredCategories.map((category, index) => (
                  <BentoGridCategory key={category.id} category={category} index={index} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </StorefrontLayout>
  );
}