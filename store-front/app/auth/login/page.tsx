"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/src/components/auth/LoginForm";
import { isAuthenticated } from "@/src/services/auth.service";
import Header from "@/src/components/layout/Header";

export default function LoginPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      setIsLoggedIn(true);
      router.push("/");
    }
  }, [router]);

  const handleLoginSuccess = () => {
    router.push("/");
  };

  if (isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        </div>
      </div>
    </div>
  );
}