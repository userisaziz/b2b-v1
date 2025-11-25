import { useState, useEffect } from "react";
import { 
  Package, 
  ListTree, 
  FileText, 
  TrendingUp, 
  ShoppingCart,
  DollarSign
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/services/product.service";
import { getCategoryChangeRequests, getCategoryAdditionRequests } from "@/services/approval.service";
import { getSellerRFQs } from "@/services/rfq.service";
import type { Product } from "@/services/product.service";
import type { CategoryChangeRequest, CategoryAdditionRequest } from "@/services/approval.service";
import type { RFQ } from "@/services/rfq.service";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    pendingRFQs: 0,
    totalRevenue: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch all required data in parallel
        const [products, categoryChangeRequests, categoryAdditionRequests, rfqs] = await Promise.all([
          getProducts(),
          getCategoryChangeRequests(),
          getCategoryAdditionRequests(),
          getSellerRFQs()
        ]);

        // Calculate stats
        const totalProducts = products.length;
        const totalCategories = categoryChangeRequests.length + categoryAdditionRequests.length;
        const pendingRFQs = (rfqs as RFQ[]).filter((rfq: RFQ) => rfq.status === 'open').length;
        
        // For revenue, we'll need to calculate from product data
        // This is a simplified calculation - in a real app, you'd have order data
        const totalRevenue = (products as Product[]).reduce((sum: number, product: Product) => sum + (product.price * product.stock), 0);

        setStats({
          totalProducts,
          totalCategories,
          pendingRFQs,
          totalRevenue
        });
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-2">{error}</div>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here's what's happening with your store today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Active products</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <ListTree className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">Product categories</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending RFQs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRFQs}</div>
            <p className="text-xs text-muted-foreground">New requests</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Estimated value</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks you can perform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate("/dashboard/products")}
              >
                <Package className="mr-2 h-4 w-4" />
                Manage Products
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate("/dashboard/categories")}
              >
                <ListTree className="mr-2 h-4 w-4" />
                Request New Category
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate("/dashboard/rfqs")}
              >
                <FileText className="mr-2 h-4 w-4" />
                View RFQs
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Store Insights</CardTitle>
            <CardDescription>
              Performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-sm">Product Growth</span>
                </div>
                <span className="text-sm font-medium text-green-600">+12%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-sm">Order Rate</span>
                </div>
                <span className="text-sm font-medium">85%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-sm">RFQ Response</span>
                </div>
                <span className="text-sm font-medium text-blue-600">78%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}