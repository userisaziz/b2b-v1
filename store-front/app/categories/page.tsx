"use client";

import { useState } from "react";
import CategoryBrowser from "@/src/components/category/CategoryBrowser";
import CategoryFilterSidebar from "@/src/components/category/CategoryFilterSidebar";
import { Category } from "@/src/services/category.service";

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse by Category</h2>
          <p className="text-gray-600">
            Explore our wide range of product categories and find what you need
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with Category Filter */}
          <div className="lg:col-span-1">
            <CategoryFilterSidebar 
              onCategorySelect={handleCategorySelect}
              selectedCategory={selectedCategory?.id}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <CategoryBrowser 
              onSelectCategory={handleCategorySelect}
              showSearch={true}
              showBreadcrumbs={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
