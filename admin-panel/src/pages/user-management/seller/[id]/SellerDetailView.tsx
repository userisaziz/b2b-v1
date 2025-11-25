import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  XCircle,
  Clock,
  User
} from "lucide-react";

// Mock seller data
const mockSeller = {
  id: "1",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  company: "Tech Solutions Inc.",
  address: "123 Main St, New York, NY 10001",
  status: "active",
  joinDate: "2023-01-15",
  lastLogin: "2024-01-20",
  totalProducts: 42,
  totalSales: 125000,
  rating: 4.8,
  verified: true
};

export default function SellerDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSeller(mockSeller);
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <XCircle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold">Seller Not Found</h2>
        <p className="text-muted-foreground mb-6">The seller you're looking for doesn't exist.</p>
        <Button onClick={() => navigate("/users/sellers")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sellers
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="gap-1 bg-green-500">
          <CheckCircle className="h-3 w-3" />
          Active
        </Badge>;
      case "pending":
        return <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>;
      case "suspended":
        return <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Suspended
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/users/sellers")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seller Details</h1>
          <p className="text-muted-foreground">
            View and manage seller information
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl">{seller.name}</CardTitle>
                <CardDescription>{seller.company}</CardDescription>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {getStatusBadge(seller.status)}
              {seller.verified && (
                <Badge variant="default" className="gap-1 bg-blue-500">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{seller.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{seller.phone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{seller.address}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Account Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p>Joined: {new Date(seller.joinDate).toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">Last login: {new Date(seller.lastLogin).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Performance Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Products</CardDescription>
                      <CardTitle className="text-2xl">{seller.totalProducts}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Total Sales</CardDescription>
                      <CardTitle className="text-2xl">${seller.totalSales.toLocaleString()}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Rating</CardDescription>
                      <CardTitle className="text-2xl">{seller.rating}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Status</CardDescription>
                      <CardTitle className="text-2xl">
                        {getStatusBadge(seller.status)}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline">Suspend Account</Button>
            <Button>Message Seller</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}