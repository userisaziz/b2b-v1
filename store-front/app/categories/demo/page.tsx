"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CategoryBrowser from "@/src/components/category/CategoryBrowser";
import CategorySearch from "@/src/components/category/CategorySearch";
import CategoryFilterSidebar from "@/src/components/category/CategoryFilterSidebar";
import CategoryDetail from "@/src/components/category/CategoryDetail";
import CategoryBreadcrumbs from "@/src/components/category/CategoryBreadcrumbs";
import { Category } from "@/src/services/category.service";

export default function CategoryDemoPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Category Management System</h1>
          <p className="text-gray-600">
            Enterprise-level category and subcategory management with hierarchical navigation
          </p>
        </div>

        <Tabs defaultValue="browser" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="browser">Category Browser</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="sidebar">Filter Sidebar</TabsTrigger>
            <TabsTrigger value="detail">Category Detail</TabsTrigger>
            <TabsTrigger value="breadcrumbs">Breadcrumbs</TabsTrigger>
          </TabsList>

          <TabsContent value="browser" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Browser</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryBrowser 
                  onSelectCategory={handleCategorySelect}
                  showSearch={true}
                  showBreadcrumbs={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Search</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-w-md mx-auto">
                  <CategorySearch 
                    onCategorySelect={handleCategorySelect}
                    placeholder="Search all categories..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sidebar" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <CategoryFilterSidebar 
                  onCategorySelect={handleCategorySelect}
                />
              </div>
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Category Browser with Sidebar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CategoryBrowser 
                      onSelectCategory={handleCategorySelect}
                      showSearch={false}
                      showBreadcrumbs={false}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="detail" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Detail View</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCategory ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-4">
                      In a real implementation, this would show the detail page for: 
                      <span className="font-semibold"> {selectedCategory.name}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Slug: {selectedCategory.slug}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      Select a category from other tabs to see its detail view
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="breadcrumbs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dynamic Breadcrumbs</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCategory ? (
                  <div className="py-4">
                    <p className="text-gray-600 mb-4">
                      Breadcrumbs for: <span className="font-semibold">{selectedCategory.name}</span>
                    </p>
                    <div className="bg-gray-100 p-4 rounded-lg">
                      {/* In a real implementation, this would show actual breadcrumbs */}
                      <p className="text-sm text-gray-600">
                        Home / Categories / {selectedCategory.name}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      Select a category from other tabs to see its breadcrumbs
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Enterprise Features</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-700">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Hierarchical category structure with unlimited nesting
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Automatic SEO-friendly slug generation
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Dynamic breadcrumb navigation
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Advanced search across all category levels
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Full CRUD API integration
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Efficient database modeling for deep nesting
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Comprehensive error handling and validation
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Performance optimized for enterprise scale
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Responsive design for all devices
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}