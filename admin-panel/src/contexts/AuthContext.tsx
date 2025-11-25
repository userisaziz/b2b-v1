import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { removeAuthToken, isAuthenticated, getUserTypeFromToken, isTokenExpired } from "@/services/auth.service";

interface AuthContextType {
  isAuthenticated: boolean;
  userType: string | null;
  login: (token: string, userType: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already authenticated on app load
    const token = localStorage.getItem("token");
    if (token && !isTokenExpired()) {
      setIsAuthenticated(true);
      const userTypeFromToken = getUserTypeFromToken();
      setUserType(userTypeFromToken);
    } else if (token) {
      // Token is expired, remove it
      removeAuthToken();
    }
  }, []);

  const login = (token: string, userType: string) => {
    localStorage.setItem("token", token);
    setIsAuthenticated(true);
    setUserType(userType);
  };

  const logout = () => {
    removeAuthToken();
    setIsAuthenticated(false);
    setUserType(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userType, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}