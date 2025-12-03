"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { User, Menu, X, MessageSquare, FileText, Search, Bell, ShoppingCart, ChevronDown } from "lucide-react";
import { getCurrentUser, logout } from "@/lib/auth";
import { useUnreadMessageCount } from "@/lib/use-unread-count";
import { socket } from "@/lib/socket";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface StorefrontLayoutProps {
  children: React.ReactNode;
}

export default function StorefrontLayout({ children }: StorefrontLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const user = getCurrentUser();
  const unreadCount = useUnreadMessageCount(user?.id || '', !!user);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      socket.connect();
      socket.emit("join_room", user.id);

      socket.on("new_message", (data: any) => {
        console.log("New message received:", data);
      });

      socket.on("notification", (data: any) => {
        console.log("Notification received:", data);
        if (data.type === "success") {
          toast.success(data.title, { description: data.message });
        } else if (data.type === "error") {
          toast.error(data.title, { description: data.message });
        } else if (data.type === "info") {
          toast.info(data.title, { description: data.message });
        } else if (data.type === "warning") {
          toast.warning(data.title, { description: data.message });
        }
      });

      return () => {
        socket.off("new_message");
        socket.off("notification");
        socket.disconnect();
      };
    }
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Bar (Alibaba style) */}
      <div className="bg-white border-b border-gray-100 hidden md:block">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="hover:text-blue-600 cursor-pointer">Sourcing Solutions</span>
            <span className="hover:text-blue-600 cursor-pointer">Services & Membership</span>
            <span className="hover:text-blue-600 cursor-pointer">Help Center</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-blue-600 cursor-pointer flex items-center gap-1">
              English - INR <ChevronDown className="h-3 w-3" />
            </span>
            <span className="hover:text-blue-600 cursor-pointer">Get the App</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 transition-all duration-300 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-8">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                B
              </div>
              <Link href="/" className="text-2xl font-bold text-slate-900 tracking-tight">
                B2B<span className="text-blue-600">Market</span>
              </Link>
            </div>

            {/* Search Bar (Centered & Prominent) */}
            <div className="hidden md:flex flex-1 max-w-3xl">
              <form onSubmit={handleSearch} className="w-full flex">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="What are you looking for..."
                    className="w-full h-11 pl-4 pr-10 border-2 border-blue-600 rounded-l-full focus:outline-none focus:ring-0 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="h-11 px-8 bg-blue-600 text-white font-semibold rounded-r-full hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Search className="h-5 w-5" />
                  Search
                </button>
              </form>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6 flex-shrink-0">
              {user ? (
                <>
                  <Link href="/messages" className="flex flex-col items-center text-gray-500 hover:text-blue-600 relative group">
                    <MessageSquare className="h-6 w-6 mb-0.5" />
                    <span className="text-[10px] font-medium">Messages</span>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link href="/rfq" className="flex flex-col items-center text-gray-500 hover:text-blue-600 group hidden lg:flex">
                    <FileText className="h-6 w-6 mb-0.5" />
                    <span className="text-[10px] font-medium">Orders</span>
                  </Link>
                  <Link href="/cart" className="flex flex-col items-center text-gray-500 hover:text-blue-600 group hidden lg:flex">
                    <ShoppingCart className="h-6 w-6 mb-0.5" />
                    <span className="text-[10px] font-medium">Cart</span>
                  </Link>

                  <div className="relative group ml-2">
                    <button className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="hidden xl:block text-left">
                        <p className="text-xs font-medium text-gray-900 max-w-[100px] truncate">{user.name}</p>
                        <p className="text-[10px] text-gray-500">My Account</p>
                      </div>
                    </button>

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
                      <div className="px-4 py-3 border-b border-gray-100 mb-2">
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link href="/my-account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                        My Profile
                      </Link>
                      <Link href="/rfq" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                        My RFQs
                      </Link>
                      <Link href="/become-seller" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600">
                        Seller Dashboard
                      </Link>
                      <div className="border-t border-gray-100 my-2"></div>
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="flex flex-col items-center text-gray-500 hover:text-blue-600"
                  >
                    <User className="h-6 w-6 mb-0.5" />
                    <span className="text-[10px] font-medium">Sign In</span>
                  </Link>
                  <Link
                    href="/register"
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-full font-bold text-sm hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all transform hover:-translate-y-0.5"
                  >
                    Join Free
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-gray-100"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white absolute w-full shadow-lg z-40">
            <div className="p-4">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </form>
              <div className="space-y-3">
                <Link href="/products" className="block px-4 py-2 text-slate-600 hover:bg-gray-50 rounded-lg">
                  Products
                </Link>
                <Link href="/categories" className="block px-4 py-2 text-slate-600 hover:bg-gray-50 rounded-lg">
                  Categories
                </Link>
                <Link href="/rfq" className="block px-4 py-2 text-slate-600 hover:bg-gray-50 rounded-lg">
                  Post RFQ
                </Link>
                <div className="border-t border-gray-100 my-2"></div>
                {user ? (
                  <>
                    <Link href="/messages" className="flex items-center justify-between px-4 py-2 text-slate-600 hover:bg-gray-50 rounded-lg">
                      <span>Messages</span>
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                    <Link href="/my-account" className="block px-4 py-2 text-slate-600 hover:bg-gray-50 rounded-lg">
                      My Account
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="space-y-2 pt-2">
                    <Link href="/login" className="block w-full px-4 py-2 text-center text-slate-700 border border-gray-200 rounded-lg hover:bg-gray-50">
                      Log in
                    </Link>
                    <Link href="/register" className="block w-full px-4 py-2 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Premium Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16 mt-auto">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  B
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">
                  B2B<span className="text-blue-500">Market</span>
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                The most trusted B2B marketplace for industrial products. Connect, trade, and grow your business with verified partners.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Platform</h4>
              <ul className="space-y-4">
                <li><Link href="/products" className="hover:text-blue-400 transition-colors">Browse Products</Link></li>
                <li><Link href="/categories" className="hover:text-blue-400 transition-colors">All Categories</Link></li>
                <li><Link href="/rfq" className="hover:text-blue-400 transition-colors">Post RFQ</Link></li>
                <li><Link href="/become-seller" className="hover:text-blue-400 transition-colors">Sell on Platform</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Support</h4>
              <ul className="space-y-4">
                <li><Link href="/help" className="hover:text-blue-400 transition-colors">Help Center</Link></li>
                <li><Link href="/safety" className="hover:text-blue-400 transition-colors">Trust & Safety</Link></li>
                <li><Link href="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-slate-500">Email:</span>
                  <span className="text-white">support@b2bmarket.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-slate-500">Phone:</span>
                  <span className="text-white">+1 (555) 123-4567</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-slate-500">Addr:</span>
                  <span className="text-white">123 Market Street,<br />Tech City, TC 90210</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              &copy; {new Date().getFullYear()} B2B Marketplace Inc. All rights reserved.
            </p>
            <div className="flex gap-6">
              {/* Social icons could go here */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}