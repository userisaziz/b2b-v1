import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  AlertCircle,
  Send,
  Download,
  MessageSquare,
  DollarSign
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getRFQById, distributeRFQ, submitQuote } from "@/services/rfq.service";
import { getSellers } from "@/services/seller.service";

interface RFQ {
  _id: string;
  title: string;
  description: string;
  productId?: string;
  categoryId?: string;
  quantity: number;
  unit: string;
  buyerId?: string;
  adminId?: string;
  status: string;
  distributionType: string;
  targetSellerIds: string[];
  responses: RFQResponse[];
  expiryDate?: string;
  specifications?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  product?: {
    name: string;
    sku: string;
    description: string;
    price: number;
    images: { url: string; alt: string }[];
  };
  category?: {
    name: string;
    description: string;
  };
  buyer?: {
    name: string;
    email: string;
  };
}

interface RFQResponse {
  sellerId: string;
  quotePrice: number;
  quoteQuantity: number;
  deliveryTime: number;
  message: string;
  status: string;
  submittedAt: string;
  seller?: {
    name: string;
    companyName: string;
    email: string;
  };
}

interface Seller {
  _id: string;
  name: string;
  email: string;
  companyName: string;
  approvalStatus: string;
}

export default function RFQDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSellers, setSelectedSellers] = useState<string[]>([]);
  const [showDistributeForm, setShowDistributeForm] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    quotePrice: 0,
    quoteQuantity: 0,
    deliveryTime: 0,
    message: ""
  });

  // Fetch RFQ details
  useEffect(() => {
    const fetchRFQ = async () => {
      try {
        setLoading(true);
        const data = await getRFQById(id!);
        setRfq(data);
        setQuoteForm(prev => ({
          ...prev,
          quoteQuantity: data.quantity
        }));
      } catch (err) {
        console.error("Error fetching RFQ:", err);
        setError("Failed to load RFQ details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRFQ();
    }
  }, [id]);

  // Fetch sellers for distribution
  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const data = await getSellers();
        setSellers(data);
      } catch (err) {
        console.error("Error fetching sellers:", err);
      }
    };

    fetchSellers();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge variant="default" className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-200">Published</Badge>;
      case "draft":
        return <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-amber-200">Draft</Badge>;
      case "closed":
        return <Badge variant="destructive" className="bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-200">Closed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-gray-500/15 text-gray-700 hover:bg-gray-500/25 border-gray-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDistributionBadge = (type: string) => {
    switch (type) {
      case "all":
        return <Badge variant="default" className="bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 border-blue-200">All Sellers</Badge>;
      case "category":
        return <Badge variant="secondary" className="bg-purple-500/15 text-purple-700 hover:bg-purple-500/25 border-purple-200">Category</Badge>;
      case "specific":
        return <Badge variant="outline" className="bg-indigo-500/15 text-indigo-700 hover:bg-indigo-500/25 border-indigo-200">Specific</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getResponseStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return <Badge variant="default" className="bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 border-blue-200">Submitted</Badge>;
      case "accepted":
        return <Badge variant="default" className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-200">Accepted</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDistribute = async () => {
    if (!id || selectedSellers.length === 0) return;
    
    try {
      await distributeRFQ(id, selectedSellers);
      // Refresh RFQ data
      const data = await getRFQById(id);
      setRfq(data);
      setShowDistributeForm(false);
      setSelectedSellers([]);
    } catch (err) {
      console.error("Error distributing RFQ:", err);
      alert("Failed to distribute RFQ");
    }
  };

  const handleQuoteSubmit = async () => {
    if (!id) return;
    
    try {
      await submitQuote(id, quoteForm);
      // Refresh RFQ data
      const data = await getRFQById(id);
      setRfq(data);
      setQuoteForm({
        quotePrice: 0,
        quoteQuantity: rfq?.quantity || 0,
        deliveryTime: 0,
        message: ""
      });
    } catch (err) {
      console.error("Error submitting quote:", err);
      alert("Failed to submit quote");
    }
  };

  const toggleSellerSelection = (sellerId: string) => {
    setSelectedSellers(prev => 
      prev.includes(sellerId) 
        ? prev.filter(id => id !== sellerId)
        : [...prev, sellerId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Error loading RFQ</h3>
          <p className="text-muted-foreground mt-1">{error}</p>
          <Button className="mt-4" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!rfq) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">RFQ not found</h3>
          <Button className="mt-4" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">RFQ Details</h1>
          <p className="text-muted-foreground mt-1">
            View and manage RFQ #{rfq._id.substring(0, 8)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* RFQ Information */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b bg-gray-50/50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{rfq.title}</CardTitle>
                  <CardDescription>
                    Created on {new Date(rfq.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(rfq.status)}
                  {getDistributionBadge(rfq.distributionType)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose max-w-none">
                <p className="text-gray-700">{rfq.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Quantity</h4>
                  <p className="text-lg font-medium">{rfq.quantity} {rfq.unit}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Expiry Date</h4>
                  <p className="text-lg font-medium">
                    {rfq.expiryDate ? new Date(rfq.expiryDate).toLocaleDateString() : "No expiry"}
                  </p>
                </div>
              </div>
              
              {rfq.specifications && Object.keys(rfq.specifications).length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Specifications</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(rfq.specifications).map(([key, value]) => (
                      <div key={key} className="border rounded-md p-3">
                        <h4 className="text-sm font-medium text-gray-500 capitalize">{key}</h4>
                        <p className="text-sm">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product/Category Information */}
          {(rfq.product || rfq.category) && (
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="border-b bg-gray-50/50 px-6 py-4">
                <CardTitle>
                  {rfq.product ? "Product Information" : "Category Information"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {rfq.product ? (
                  <div className="flex gap-6">
                    {rfq.product.images && rfq.product.images.length > 0 && (
                      <div className="flex-shrink-0">
                        <img 
                          src={rfq.product.images[0].url} 
                          alt={rfq.product.images[0].alt}
                          className="w-24 h-24 object-cover rounded-md"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-medium">{rfq.product.name}</h3>
                      <p className="text-sm text-muted-foreground">SKU: {rfq.product.sku}</p>
                      <p className="text-sm mt-2">{rfq.product.description}</p>
                      <p className="text-lg font-medium mt-2">Price: SAR {rfq.product.price}</p>
                    </div>
                  </div>
                ) : rfq.category ? (
                  <div>
                    <h3 className="text-lg font-medium">{rfq.category.name}</h3>
                    <p className="text-sm mt-2">{rfq.category.description}</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}

          {/* Seller Responses */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b bg-gray-50/50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Seller Responses</CardTitle>
                  <CardDescription>
                    {rfq.responses.length} responses received
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setShowDistributeForm(!showDistributeForm)}
                  variant="outline"
                >
                  Distribute to Sellers
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {showDistributeForm && (
                <div className="border-b p-6">
                  <h3 className="text-lg font-medium mb-4">Distribute RFQ to Sellers</h3>
                  <div className="max-h-60 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Select</TableHead>
                          <TableHead>Seller</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sellers.map((seller) => (
                          <TableRow key={seller._id}>
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedSellers.includes(seller._id)}
                                onChange={() => toggleSellerSelection(seller._id)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                              />
                            </TableCell>
                            <TableCell className="font-medium">{seller.name}</TableCell>
                            <TableCell>{seller.companyName}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={seller.approvalStatus === "approved" ? "default" : "secondary"}
                                className={
                                  seller.approvalStatus === "approved" 
                                    ? "bg-emerald-500/15 text-emerald-700" 
                                    : "bg-amber-500/15 text-amber-700"
                                }
                              >
                                {seller.approvalStatus}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <Button variant="outline" onClick={() => setShowDistributeForm(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleDistribute} disabled={selectedSellers.length === 0}>
                      Distribute ({selectedSellers.length} selected)
                    </Button>
                  </div>
                </div>
              )}

              {rfq.responses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Seller</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Delivery</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rfq.responses.map((response) => (
                      <TableRow key={response.sellerId}>
                        <TableCell>
                          <div className="font-medium">
                            {response.seller?.name || "Unknown Seller"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {response.seller?.companyName}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          SAR {response.quotePrice}
                        </TableCell>
                        <TableCell>
                          {response.quoteQuantity} {rfq.unit}
                        </TableCell>
                        <TableCell>
                          {response.deliveryTime} days
                        </TableCell>
                        <TableCell>
                          {getResponseStatusBadge(response.status)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(response.submittedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No responses yet</h3>
                  <p className="text-muted-foreground mt-1">
                    Sellers haven't submitted quotes for this RFQ
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* RFQ Actions */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b bg-gray-50/50 px-6 py-4">
              <CardTitle>RFQ Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <Button className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button className="w-full" variant="outline">
                <Send className="h-4 w-4 mr-2" />
                Send Reminder
              </Button>
              <Button className="w-full text-red-600" variant="outline">
                Close RFQ
              </Button>
            </CardContent>
          </Card>

          {/* Quote Submission Form */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b bg-gray-50/50 px-6 py-4">
              <CardTitle>Submit Quote</CardTitle>
              <CardDescription>
                Provide your quotation for this RFQ
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quotePrice">Price per unit</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="quotePrice"
                      type="number"
                      value={quoteForm.quotePrice}
                      onChange={(e) => setQuoteForm({...quoteForm, quotePrice: Number(e.target.value)})}
                      className="pl-10"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quoteQuantity">Quantity</Label>
                  <Input
                    id="quoteQuantity"
                    type="number"
                    value={quoteForm.quoteQuantity}
                    onChange={(e) => setQuoteForm({...quoteForm, quoteQuantity: Number(e.target.value)})}
                    min="0"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deliveryTime">Delivery Time (days)</Label>
                <Input
                  id="deliveryTime"
                  type="number"
                  value={quoteForm.deliveryTime}
                  onChange={(e) => setQuoteForm({...quoteForm, deliveryTime: Number(e.target.value)})}
                  min="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={quoteForm.message}
                  onChange={(e) => setQuoteForm({...quoteForm, message: e.target.value})}
                  placeholder="Add any additional information..."
                  rows={3}
                />
              </div>
              
              <Button className="w-full" onClick={handleQuoteSubmit}>
                <Send className="h-4 w-4 mr-2" />
                Submit Quote
              </Button>
            </CardContent>
          </Card>

          {/* Target Sellers */}
          {rfq.targetSellerIds.length > 0 && (
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="border-b bg-gray-50/50 px-6 py-4">
                <CardTitle>Target Sellers</CardTitle>
                <CardDescription>
                  {rfq.targetSellerIds.length} sellers targeted
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {rfq.targetSellerIds.slice(0, 5).map((sellerId, index) => (
                    <div key={sellerId} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {rfq.responses.find(r => r.sellerId === sellerId)?.seller?.name || "Unknown Seller"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {rfq.responses.find(r => r.sellerId === sellerId)?.seller?.companyName || "Company"}
                        </p>
                      </div>
                    </div>
                  ))}
                  {rfq.targetSellerIds.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center">
                      + {rfq.targetSellerIds.length - 5} more sellers
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}