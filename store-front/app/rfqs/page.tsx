"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RFQList from "@/src/components/rfq/RFQList";
import RFQForm from "@/src/components/rfq/RFQForm";
import { isAuthenticated } from "@/src/services/auth.service";
import Header from "@/src/components/layout/Header";

export default function RFQsPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please login to view RFQs</h1>
          <button 
            onClick={() => router.push("/login?redirect=/rfqs")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {showCreateForm ? (
          <div className="max-w-2xl mx-auto">
            <RFQForm onSuccess={handleCreateSuccess} />
          </div>
        ) : (
          <RFQList />
        )}
      </div>
    </div>
  );
}