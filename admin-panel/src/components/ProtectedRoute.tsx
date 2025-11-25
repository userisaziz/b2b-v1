import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { isTokenExpired } from "@/services/auth.service";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, userType, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if token is expired
    if (isTokenExpired()) {
      logout();
      navigate("/login");
      return;
    }
    
    // If user is not authenticated or not an admin, redirect to login
    if (!isAuthenticated || userType !== "admin") {
      navigate("/login");
    }
  }, [isAuthenticated, userType, navigate, logout]);

  // If user is authenticated and is an admin, render the children
  if (isAuthenticated && userType === "admin") {
    return <>{children}</>;
  }

  // If not authenticated or not admin, render nothing while redirecting
  return null;
}