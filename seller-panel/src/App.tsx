import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "@/components/layouts/AuthLayout";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import ProtectedRoute from "@/components/layouts/ProtectedRoute";
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import DashboardPage from "@/pages/dashboard/page";
import ProductsPage from "@/pages/dashboard/products/page";
import AddProductPage from "@/pages/dashboard/products/new/page";
import EditProductPage from "@/pages/dashboard/products/[id]/page";
import CategoriesPage from "@/pages/dashboard/categories/page";
import CategoryRequestPage from "@/pages/dashboard/categories/request/page";
import RFQsPage from "@/pages/dashboard/rfqs/page";
import { SidebarProvider } from "@/contexts/SidebarContext";

function App() {
  return (
    <SidebarProvider>
      <Router>
        <Routes>
            <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/products" element={<ProductsPage />} />
          <Route path="/dashboard/products/new" element={<AddProductPage />} />
          <Route path="/dashboard/products/:id" element={<EditProductPage />} />
          <Route path="/dashboard/categories" element={<CategoriesPage />} />
          <Route path="/dashboard/categories/request" element={<CategoryRequestPage />} />
          <Route path="/dashboard/rfqs" element={<RFQsPage />} />
        </Route>
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
    </SidebarProvider>
  );
}

export default App;