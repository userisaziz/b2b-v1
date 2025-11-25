import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { getCurrentSeller } from "../../services/auth.service";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("sellerToken");
      
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        // Verify token by fetching user profile
        await getCurrentSeller();
        setIsAuthenticated(true);
      } catch (error) {
        // Token is invalid, remove it and redirect to login
        localStorage.removeItem("sellerToken");
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}