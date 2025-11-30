"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/src/components/layout/Header";
import LoginForm from "@/src/components/auth/LoginForm";
import RegisterForm from "@/src/components/auth/RegisterForm";
import RFQList from "@/src/components/rfq/RFQList";
import RFQForm from "@/src/components/rfq/RFQForm";
import { isAuthenticated, getCurrentUser } from "@/src/services/auth.service";

export default function DemoPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeView, setActiveView] = useState<'login' | 'register' | 'rfqs' | 'create-rfq'>('login');
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = isAuthenticated();
      setIsLoggedIn(authStatus);
      
      if (authStatus) {
        const currentUser = getCurrentUser();
        setUser(currentUser);
        setActiveView('rfqs');
      }
    };

    checkAuth();
  }, []);

  const handleAuthSuccess = () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoggedIn(true);
    setActiveView('rfqs');
  };

  const handleCreateRFQSuccess = () => {
    setActiveView('rfqs');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setActiveView('login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {!isLoggedIn ? (
          <div className="max-w-md mx-auto">
            {activeView === 'login' ? (
              <>
                <LoginForm onLoginSuccess={handleAuthSuccess} />
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button
                      onClick={() => setActiveView('register')}
                      className="text-blue-600 hover:underline"
                    >
                      Register here
                    </button>
                  </p>
                </div>
              </>
            ) : (
              <>
                <RegisterForm onRegisterSuccess={handleAuthSuccess} />
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <button
                      onClick={() => setActiveView('login')}
                      className="text-blue-600 hover:underline"
                    >
                      Login here
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">RFQ Dashboard</h1>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveView('rfqs')}
                  className={`px-4 py-2 rounded-md ${activeView === 'rfqs' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  View RFQs
                </button>
                <button
                  onClick={() => setActiveView('create-rfq')}
                  className={`px-4 py-2 rounded-md ${activeView === 'create-rfq' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Create RFQ
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>

            {activeView === 'rfqs' ? (
              <RFQList />
            ) : (
              <div className="max-w-2xl mx-auto">
                <RFQForm onSuccess={handleCreateRFQSuccess} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}