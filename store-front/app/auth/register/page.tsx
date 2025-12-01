"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RegisterForm from "@/src/components/auth/RegisterForm";
import { isAuthenticated } from "@/src/services/auth.service";
import StorefrontLayout from "@/components/layout/StorefrontLayout";

export default function RegisterPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      setIsLoggedIn(true);
      router.push("/");
    }
  }, [router]);

  const handleRegisterSuccess = () => {
    // Registration success message is handled in the component
  };

  if (isLoggedIn) {
    return null;
  }

  return (
    <StorefrontLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}