"use client";

import { useState, useEffect } from "react";
import { Search, ArrowRight, TrendingUp, ShieldCheck, Globe, FileText, Package, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getProducts, getCategories, Category, Product } from "@/lib/storefront";
import StorefrontLayout from "@/components/layout/StorefrontLayout";
import ProductSlider from "@/components/ProductSlider";
import HomepageRFQForm from "@/components/HomepageRFQForm";

export default function StorefrontHomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoryProducts, setCategoryProducts] = useState<Record<string, Product[]>>({});

  // Load categories and featured products once on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load categories
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        
        // Load featured products (limit to 20)
        const productsData = await getProducts({ limit: 20 });
        setProducts(productsData.data);
        
        // Load products for each category (limit to 15-20 per category)
        const categoryProductsData: Record<string, Product[]> = {};
        for (const category of categoriesData) { // Load for all categories
          try {
            const categoryProducts = await getProducts({ 
              category: category.id, 
              limit: 20 
            });
            categoryProductsData[category.id] = categoryProducts.data;
          } catch (error) {
            console.error(`Error loading products for category ${category.id}:`, error);
            categoryProductsData[category.id] = [];
          }
        }
        setCategoryProducts(categoryProductsData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Load products when filters change
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const productsData = await getProducts({
          category: selectedCategory || undefined,
          search: searchTerm || undefined,
          limit: 12
        });
        setProducts(productsData.data);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [selectedCategory, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search term is already in state, useEffect will handle the reload
  };

  return (
    <StorefrontLayout>
      {/* Hero Section */}
      <section className="relative bg-slate-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-slate-900/80"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-sm font-medium">The Future of B2B Commerce</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
              Sourcing Made <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Simple</span> & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Smart</span>
            </h1>

            <p className="text-xl md:text-2xl mb-10 text-slate-300 font-light leading-relaxed">
              Connect with verified manufacturers, wholesalers, and suppliers globally.
              Post RFQs and get competitive quotes in minutes.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex bg-white p-2 rounded-xl shadow-2xl">
                <div className="flex-1 flex items-center pl-4">
                  <Search className="h-6 w-6 text-slate-400" />
                  <input
                    type="text"
                    placeholder="What are you looking for today?"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 text-lg text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg shadow-blue-600/20 flex items-center gap-2"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Stats/Features */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
              <div className="flex flex-col items-center md:items-start gap-2">
                <div className="p-3 bg-slate-800 rounded-lg text-blue-400 mb-2">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-white font-semibold">Verified Suppliers</h3>
                <p className="text-slate-400 text-sm">100% vetted business partners</p>
              </div>
              <div className="flex flex-col items-center md:items-start gap-2">
                <div className="p-3 bg-slate-800 rounded-lg text-blue-400 mb-2">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-white font-semibold">Competitive Pricing</h3>
                <p className="text-slate-400 text-sm">Direct from manufacturers</p>
              </div>
              <div className="flex flex-col items-center md:items-start gap-2">
                <div className="p-3 bg-slate-800 rounded-lg text-blue-400 mb-2">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="text-white font-semibold">Global Reach</h3>
                <p className="text-slate-400 text-sm">Shipping to 150+ countries</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RFQ Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <HomepageRFQForm />
      </section>

      {/* All Categories Grid - Alibaba Style */}
      <section className="bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900">Browse Categories</h2>
            <Link 
              href="/categories" 
              className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1 group"
            >
              View All Categories
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-6 border border-slate-100 shadow-sm animate-pulse">
                  <div className="h-12 w-12 bg-slate-200 rounded-lg mb-4 mx-auto"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.id}`}
                  className="group bg-white rounded-xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-200 flex flex-col items-center text-center group"
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                    {category.image ? (
                      <img 
                        src={category.image} 
                        alt={category.name} 
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <Package className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                  <h3 className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {category.name}
                  </h3>
                  {category.productCount !== undefined && category.productCount > 0 && (
                    <p className="text-xs text-slate-500 mt-1">
                      {category.productCount} products
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Category-specific Product Sections */}
      {Object.entries(categoryProducts).map(([categoryId, products]) => {
        const category = categories.find(c => c.id === categoryId);
        if (!category || products.length === 0) return null;
        
        // Filter out products with undefined IDs
        const validProducts = products.filter(product => product.id && product.id !== 'undefined');
        if (validProducts.length === 0) return null;
        
        return (
          <section key={categoryId} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-bold text-slate-900">{category.name}</h2>
              <Link 
                href={`/categories/${categoryId}`} 
                className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1 group"
              >
                View All {category.name} Products
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {validProducts.slice(0, 8).map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full"
                >
                  <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
                        No Image
                      </div>
                    )}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md shadow-sm text-slate-700">
                        Verified
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="mb-2">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        {product.category?.name || "General"}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-1 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      {product.users?.company || "Verified Seller"}
                    </p>
                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400">Price per unit</p>
                        <p className="text-xl font-bold text-slate-900">
                          ₹{product.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">MOQ</p>
                        <p className="text-sm font-medium text-slate-700">
                          {product.min_order_quantity} units
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      {/* Categories Filter */}
      <section className="bg-white border-b border-slate-100 sticky top-20 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${!selectedCategory
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${selectedCategory === category.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Slider */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <ProductSlider 
          products={products} 
          title="Featured Products" 
        />
      </section>

      {/* Original Products Grid (for search/filter results) */}
      {selectedCategory || searchTerm ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Search Results</h2>
              <p className="text-slate-500">Products matching your criteria</p>
            </div>
            <button
              onClick={() => { setSearchTerm(""); setSelectedCategory(""); }}
              className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1 group"
            >
              Clear Filters
            </button>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-6 text-slate-500 font-medium">Finding best products for you...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <p className="text-slate-500 text-lg">No products found matching your criteria</p>
              <button
                onClick={() => { setSearchTerm(""); setSelectedCategory(""); }}
                className="mt-4 text-blue-600 font-medium hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {/* Filter out products with undefined IDs */}
              {products.filter(product => product.id && product.id !== 'undefined').map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full"
                >
                  <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
                        No Image
                      </div>
                    )}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md shadow-sm text-slate-700">
                        Verified
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="mb-2">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        {product.category?.name || "General"}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-1 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      {product.users?.company || "Verified Seller"}
                    </p>
                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400">Price per unit</p>
                        <p className="text-xl font-bold text-slate-900">
                          ₹{product.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">MOQ</p>
                        <p className="text-sm font-medium text-slate-700">
                          {product.min_order_quantity} units
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      ) : null}
    </StorefrontLayout>
  );
}