"use client";

import { useState, useEffect } from "react";
import {
  Search, ArrowRight, TrendingUp, ShieldCheck, Globe, FileText,
  Package, ChevronRight, Grid3x3, Layers, User, MessageSquare,
  LogOut, Menu, Zap, Star, Clock, CheckCircle
} from "lucide-react";
import Link from "next/link";
import { getProducts, getCategories, Category, Product } from "@/lib/storefront";
import StorefrontLayout from "@/components/layout/StorefrontLayout";
import ProductSlider from "@/components/ProductSlider";
import HomepageRFQForm from "@/components/HomepageRFQForm";
import { getCurrentUser } from "@/lib/auth";

export default function StorefrontHomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryHierarchy, setCategoryHierarchy] = useState<Record<string, Category[]>>({});
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    const loadData = async () => {
      try {
        setLoading(true);

        // Load categories
        const categoriesData = await getCategories();
        setCategories(categoriesData);

        // Build category hierarchy
        const hierarchy: Record<string, Category[]> = {};
        const rootCategories: Category[] = [];

        categoriesData.forEach(category => {
          if (!category.parent_id) {
            rootCategories.push(category);
          }
        });

        rootCategories.forEach(rootCat => {
          const subcategories = categoriesData.filter(cat => cat.parent_id === rootCat._id);
          hierarchy[rootCat._id] = subcategories;
        });

        setCategoryHierarchy(hierarchy);

        // Load featured products
        const productsData = await getProducts({ limit: 24 });
        setProducts(productsData.data);

      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm) {
      window.location.href = `/products?search=${encodeURIComponent(searchTerm)}`;
    }
  };

  const rootCategories = categories.filter(cat => !cat.parent_id).slice(0, 10);

  return (
    <StorefrontLayout>
      {/* Top Section: Categories | Hero | User Widget */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[500px]">

            {/* Left Sidebar: Categories */}
            <div className="hidden lg:block w-64 flex-shrink-0 bg-white border border-gray-200 rounded-lg shadow-sm h-full overflow-y-auto relative">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Menu className="h-5 w-5" /> Categories
                </h3>
              </div>
              <ul className="py-2">
                {rootCategories.map((category) => (
                  <li
                    key={category._id}
                    className="group"
                    onMouseEnter={() => setActiveCategory(category._id)}
                    onMouseLeave={() => setActiveCategory(null)}
                  >
                    <Link
                      href={`/categories/${category._id}`}
                      className="flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {/* Placeholder Icon if no image */}
                        <Package className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                        <span className="truncate">{category.name}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </Link>

                    {/* Subcategory Flyout (Simple implementation) */}
                    {activeCategory === category._id && categoryHierarchy[category._id]?.length > 0 && (
                      <div className="absolute left-full top-0 w-[600px] h-full bg-white border border-gray-200 shadow-xl z-50 p-6 overflow-y-auto hidden lg:block rounded-r-lg">
                        <h4 className="font-bold text-lg mb-4 text-gray-800">{category.name}</h4>
                        <div className="grid grid-cols-3 gap-6">
                          {categoryHierarchy[category._id].map(sub => (
                            <Link
                              key={sub._id}
                              href={`/categories/${sub._id}`}
                              className="text-sm text-gray-600 hover:text-blue-600 block mb-2"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </li>
                ))}
                <li className="px-4 py-3 border-t border-gray-100 mt-2">
                  <Link href="/categories" className="text-sm font-semibold text-blue-600 flex items-center gap-1 hover:underline">
                    All Categories <ArrowRight className="h-3 w-3" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Center: Hero Carousel */}
            <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden relative group h-[300px] lg:h-full">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-60 transition-transform duration-700 group-hover:scale-105"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>

              <div className="relative h-full flex flex-col justify-center px-8 md:px-16 max-w-3xl">
                <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full w-fit mb-6 animate-fade-in">
                  NEW ARRIVALS
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Global Sourcing <br />
                  <span className="text-blue-400">Made Simple</span>
                </h1>
                <p className="text-lg text-gray-300 mb-8 max-w-xl">
                  Connect with top-rated manufacturers and wholesalers.
                  Quality products at factory prices.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/products"
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 text-center"
                  >
                    Start Sourcing
                  </Link>
                  <Link
                    href="/become-seller"
                    className="px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/30 font-semibold rounded-lg transition-all text-center"
                  >
                    Become a Supplier
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Sidebar: User Widget */}
            <div className="hidden lg:flex w-72 flex-shrink-0 flex-col gap-6">
              {/* User Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex-1 flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Welcome back!</p>
                    <p className="font-bold text-gray-900 truncate max-w-[140px]">
                      {currentUser ? currentUser.name : "Guest User"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {currentUser ? (
                    <>
                      <Link href="/messages" className="block w-full py-2 px-4 bg-blue-50 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100 text-center transition-colors">
                        Messages
                      </Link>
                      <Link href="/rfq" className="block w-full py-2 px-4 bg-gray-50 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-100 text-center transition-colors">
                        My RFQs
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="block w-full py-2 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 text-center transition-colors shadow-sm">
                        Sign In
                      </Link>
                      <Link href="/register" className="block w-full py-2 px-4 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 text-center transition-colors">
                        Join for Free
                      </Link>
                    </>
                  )}
                </div>

                <div className="mt-auto pt-6 border-t border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/rfq" className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors group">
                      <FileText className="h-5 w-5 mb-1 text-gray-500 group-hover:text-blue-600" />
                      <span className="text-xs font-medium">Post RFQ</span>
                    </Link>
                    <Link href="/become-seller" className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors group">
                      <TrendingUp className="h-5 w-5 mb-1 text-gray-500 group-hover:text-blue-600" />
                      <span className="text-xs font-medium">Sell</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Promo Card */}
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg p-6 text-white shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-20">
                  <Zap className="h-24 w-24" />
                </div>
                <h3 className="font-bold text-lg mb-2 relative z-10">Trade Assurance</h3>
                <p className="text-sm text-white/90 mb-4 relative z-10">
                  Protect your orders from payment to delivery.
                </p>
                <Link href="/safety" className="inline-block text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors relative z-10">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-3 text-gray-600">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Globe className="h-5 w-5 text-blue-600" />
              <span>Global Shipping</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <CheckCircle className="h-5 w-5 text-orange-600" />
              <span>Verified Suppliers</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Just For You / Recommended Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
            <Link href="/products" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-4 shadow-sm animate-pulse h-64"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {products.filter(p => p._id && p._id !== 'undefined').map((product) => (
                <Link
                  key={product._id}
                  href={`/products/${product._id}`}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col"
                >
                  <div className="aspect-square relative bg-gray-100 overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <div className="mt-auto">
                      <p className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-1">{product.min_order_quantity} MOQ</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* RFQ Section */}
      <section className="py-12 bg-white border-y border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-900 rounded-2xl overflow-hidden shadow-xl">
            <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12 items-center">
              <div className="text-white">
                <h2 className="text-3xl font-bold mb-4">Request for Quotation</h2>
                <p className="text-blue-100 mb-8 text-lg">
                  One request, multiple quotes. Tell us what you need, and we'll connect you with verified suppliers.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center text-blue-300 font-bold">1</div>
                    <span>Submit your request</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center text-blue-300 font-bold">2</div>
                    <span>Compare quotes</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center text-blue-300 font-bold">3</div>
                    <span>Contact suppliers</span>
                  </li>
                </ul>
                <Link
                  href="/rfq"
                  className="inline-block px-8 py-3 bg-white text-blue-900 font-bold rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Post RFQ Now
                </Link>
              </div>
              <div className="hidden md:block">
                <img
                  src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80"
                  alt="RFQ"
                  className="rounded-xl shadow-lg transform rotate-2 hover:rotate-0 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Source by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {categories.slice(0, 10).map((category) => (
              <Link
                key={category._id}
                href={`/categories/${category._id}`}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  {category.image ? (
                    <img src={category.image} alt={category.name} className="w-10 h-10 object-contain" />
                  ) : (
                    <Package className="h-8 w-8 text-gray-500 group-hover:text-blue-600" />
                  )}
                </div>
                <h3 className="font-medium text-gray-900 group-hover:text-blue-600">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </StorefrontLayout>
  );
}