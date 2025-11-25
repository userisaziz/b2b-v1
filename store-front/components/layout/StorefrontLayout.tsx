"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { User, Menu, X, MessageSquare, FileText, Search, Bell } from "lucide-react";
import { getCurrentUser, logout } from "@/lib/auth";
import { useUnreadMessageCount } from "@/lib/use-unread-count";
import { socket } from "@/lib/socket";
import { toast } from "sonner";

interface StorefrontLayoutProps {
  children: React.ReactNode;
}

export default function StorefrontLayout({ children }: StorefrontLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = getCurrentUser();
  const unreadCount = useUnreadMessageCount(user?.id || '', !!user);

  useEffect(() => {
    if (user) {
      socket.connect();
      socket.emit("join_room", user.id);

      socket.on("new_message", (data) => {
        // Ideally we would update a global state or trigger a toast here
        // For now, the unread count hook should handle polling or we can add real-time increment logic later
        console.log("New message received:", data);
      });

      // Listen for general notifications
      socket.on("notification", (data) => {
        console.log("Notification received:", data);
        if (data.type === "success") {
          toast.success(data.title, {
            description: data.message,
            duration: 5000
          });
        } else if (data.type === "error") {
          toast.error(data.title, {
            description: data.message,
            duration: 5000
          });
        } else if (data.type === "info") {
          toast.info(data.title, {
            description: data.message,
            duration: 5000
          });
        } else if (data.type === "warning") {
          toast.warning(data.title, {
            description: data.message,
            duration: 5000
          });
        }
      });

      return () => {
        socket.off("new_message");
        socket.off("notification");
        socket.disconnect();
      };
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                B
              </div>
              <Link href="/" className="text-2xl font-bold text-slate-900 tracking-tight">
                B2B<span className="text-blue-600">Market</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/products" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                Products
              </Link>
              <Link href="/categories" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                Categories
              </Link>
              <Link href="/rfq" className="text-slate-600 hover:text-blue-600 font-medium transition-colors flex items-center gap-1">
                Post RFQ
              </Link>
              <div className="h-6 w-px bg-gray-200 mx-2"></div>
              <Link href="/become-seller" className="text-slate-900 hover:text-blue-600 font-semibold transition-colors">
                Become a Seller
              </Link>
            </nav>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  <Link href="/messages" className="relative p-2 text-slate-600 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50">
                    <MessageSquare className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  <div className="relative group">
                    <button className="flex items-center gap-2 p-1 pr-3 rounded-full border border-gray-200 hover:border-blue-200 hover:shadow-sm transition-all bg-white">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate">{user.name}</span>
                    </button>

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
                      <Link href="/my-account" className="block px-4 py-2 text-sm text-slate-700 hover:bg-gray-50">
                        My Account
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="px-5 py-2.5 text-slate-700 font-medium hover:text-blue-600 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all transform hover:-translate-y-0.5"
                  >
                    Sign up
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
          <div className="md:hidden border-t border-gray-100 bg-white absolute w-full shadow-lg">
            <div className="px-4 py-4 space-y-3">
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
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Premium Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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