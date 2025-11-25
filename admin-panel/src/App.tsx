import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "@/components/layouts/AuthLayout.tsx";
import DashboardLayout from "@/components/layouts/DashboardLayout.tsx";
import LoginPage from "@/pages/auth/LoginPage.tsx";
import DashboardPage from "@/pages/dashboard/DashboardPage.tsx";
import SellerManagementPage from "@/pages/user-management/SellerManagementPage.tsx";
import BuyerManagementPage from "@/pages/user-management/BuyerManagementPage.tsx";
import UserManagementPage from "@/pages/user-management/UserManagementPage.tsx";
import SellerApprovalPage from "@/pages/approvals/SellerApprovalPage.tsx";
import ProductApprovalPage from "@/pages/approvals/ProductApprovalPage.tsx";
import CategoryApprovalPage from "@/pages/approvals/CategoryApprovalPage.tsx";
import SellerDetailView from "@/pages/user-management/seller/[id]/SellerDetailView";
import BuyerDetailView from "@/pages/user-management/buyer/[id]/BuyerDetailView";
import ProductDetailView from "@/pages/details/ProductDetailView";
import CategoryDetailView from "@/pages/details/CategoryDetailView";
import SellerApprovalDetailView from "@/pages/details/SellerApprovalDetailView";
import ProductApprovalDetailView from "@/pages/details/ProductApprovalDetailView";
import CategoryApprovalDetailView from "@/pages/details/CategoryApprovalDetailView";
import CategoriesPage from "@/pages/categories/page";
import EditCategoryPage from "@/pages/categories/[id]/edit/page";
import NewCategoryPage from "@/pages/categories/AddCategoryPage";
import ProductsPage from "@/pages/products/page";
import NewProductPage from "@/pages/products/new/page";
import EditProductPage from "@/pages/products/[id]/edit/page";
import ProductDetailPage from "@/pages/products/[id]/page";
// RFQ Pages
import RFQListPage from "@/pages/rfqs/RFQListPage";
import RFQDetailPage from "@/pages/rfqs/RFQDetailPage";
import CreateRFQPage from "@/pages/rfqs/CreateRFQPage";
import { SidebarProvider } from "@/contexts/SidebarContext";
import ProtectedRoute from "@/components/ProtectedRoute";

function App() {
  return (
    <SidebarProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/users" element={<UserManagementPage />} />
            <Route path="/users/sellers" element={<SellerManagementPage />} />
            <Route path="/users/sellers/:id" element={<SellerDetailView />} />
            <Route path="/users/buyers" element={<BuyerManagementPage />} />
            <Route path="/users/buyers/:id" element={<BuyerDetailView />} />
            <Route path="/approvals/sellers" element={<SellerApprovalPage />} />
            <Route path="/approvals/sellers/:id" element={<SellerApprovalDetailView />} />
            <Route path="/approvals/products" element={<ProductApprovalPage />} />
            <Route path="/approvals/products/:id" element={<ProductApprovalDetailView />} />
            <Route path="/approvals/categories" element={<CategoryApprovalPage />} />
            <Route path="/approvals/categories/:id" element={<CategoryApprovalDetailView />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/categories/:id" element={<CategoryDetailView />} />
            <Route path="/categories/:id/edit" element={<EditCategoryPage />} />
            <Route path="/categories/new" element={<NewCategoryPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/new" element={<NewProductPage />} />
            <Route path="/products/:id/edit" element={<EditProductPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            {/* RFQ Routes */}
            <Route path="/rfqs" element={<RFQListPage />} />
            <Route path="/rfqs/new" element={<CreateRFQPage />} />
            <Route path="/rfqs/:id" element={<RFQDetailPage />} />
          </Route>

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </SidebarProvider>
  );
}

export default App;