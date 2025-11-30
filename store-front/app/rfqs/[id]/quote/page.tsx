"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import QuoteForm from "@/src/components/rfq/QuoteForm";
import { isAuthenticated } from "@/src/services/auth.service";
import Header from "@/src/components/layout/Header";

export default function SubmitQuotePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  const handleQuoteSuccess = () => {
    // Redirect to RFQ list after successful submission
    router.push("/rfqs");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please login to submit a quote</h1>
          <button 
            onClick={() => router.push(`/login?redirect=/rfqs/${id}/quote`)}
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
        <div className="max-w-2xl mx-auto">
          <QuoteForm rfqId={id} onSuccess={handleQuoteSuccess} />
        </div>
      </div>
    </div>
  );
}