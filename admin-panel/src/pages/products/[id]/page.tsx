import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Edit,
  Trash2,
  Package,
  DollarSign,
  Layers,
  Tag,
  Store,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getProduct, deleteProduct } from "@/services/product.service";
import { StatsCard } from "@/components/common/StatsCard";
import { createRFQ } from "@/services/rfq.service";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getProduct(id);
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      navigate("/products");
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product");
    }
  };

  const handleCreateRFQ = async () => {
    if (!id || !product) return;
    
    try {
      const rfqData = {
        title: `RFQ for ${product.name}`,
        description: `Request for quotation for product: ${product.name}`,
        productId: id,
        quantity: 1,
        unit: "piece",
        distributionType: "all"
      };
      
      const response = await createRFQ(rfqData);
      // Navigate to the newly created RFQ
      navigate(`/rfqs/${response.rfq._id}`);
    } catch (err) {
      console.error("Error creating RFQ:", err);
      alert("Failed to create RFQ");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-destructive text-lg font-medium">{error || "Product not found"}</p>
        <Button onClick={() => navigate("/products")}>Back to Products</Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">Pending</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/products")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{product.name}</h1>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">{product.slug}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                {getStatusBadge(product.status)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCreateRFQ}>
            <FileText className="h-4 w-4 mr-2" />
            Create RFQ
          </Button>
          <Button variant="outline" onClick={() => navigate(`/products/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Price"
          value={`${product.currency === 'USD' ? '$' : product.currency === 'EUR' ? '€' : product.currency === 'GBP' ? '£' : '₹'}${product.price}`}
          description="Unit Price"
          icon={DollarSign}
          iconColor="emerald"
        />
        <StatsCard
          title="Stock"
          value={product.stock}
          description={product.stock < 10 ? "Low Stock" : "In Stock"}
          icon={Package}
          iconColor={product.stock < 10 ? "red" : "blue"}
        />
        <StatsCard
          title="MOQ"
          value={product.moq}
          description="Minimum Order Qty"
          icon={Layers}
          iconColor="purple"
        />
        <StatsCard
          title="GST Rate"
          value={`${product.gstPercent}%`}
          description={`HSN: ${product.hsnCode || 'N/A'}`}
          icon={Tag}
          iconColor="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Images Gallery */}
          {product.images && product.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {product.images.map((img: any, i: number) => (
                    <div key={i} className="aspect-square rounded-lg border overflow-hidden bg-gray-50">
                      <img src={img.url} alt={img.alt || product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Meta Title</p>
                  <p className="text-sm">{product.metaTitle || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Meta Description</p>
                  <p className="text-sm">{product.metaDescription || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Details */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Seller Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{product.seller?.shopName || product.seller?.name || "Unknown Seller"}</p>
                  <p className="text-sm text-muted-foreground">{product.seller?.email}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Brand</p>
                <p className="text-sm">{product.brand || "-"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categories & Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {product.categories && product.categories.length > 0 ? (
                    product.categories.map((cat: any) => (
                      <Badge key={cat._id || cat} variant="outline">{cat.name || "Category"}</Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No categories</p>
                  )}
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {product.tags && product.tags.length > 0 ? (
                    product.tags.map((tag: string, i: number) => (
                      <Badge key={i} variant="secondary">{tag}</Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No tags</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}