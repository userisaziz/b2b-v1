"use client";

import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function DashboardLayout() {
  const location = useLocation();
  
  // Navigation items for header title
  const navigationItems = [
    {
      title: "Home",
      href: "/dashboard",
    },
    {
      title: "Products",
      href: "/dashboard/products",
    },
    {
      title: "Categories",
      href: "/dashboard/categories",
    },
    {
      title: "RFQs",
      href: "/dashboard/rfqs",
    },
  ];

  const getCurrentTitle = () => {
    const currentItem = navigationItems.find(item => location.pathname === item.href);
    return currentItem ? currentItem.title : "Dashboard";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main content - adjusted for sidebar */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="h-16 flex items-center px-6 border-b border-gray-200 bg-white ml-0 lg:ml-0">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-xl font-semibold text-gray-900">
              {getCurrentTitle()}
            </h1>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-800 font-medium text-sm">S</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
