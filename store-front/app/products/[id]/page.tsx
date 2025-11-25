"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  MessageSquare, 
  Building2, 
  MapPin, 
  Package, 
  Shield,
  Star
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getProductById, Product, trackProductView, trackCatalogueView } from "@/lib/storefront";
import { getCurrentUser } from "@/lib/auth";
import { sendMessage } from "@/lib/storefront";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageForm, setMessageForm] = useState({ subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const user = getCurrentUser();

  useEffect(() => {
    loadProduct();
  }, [params.id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await getProductById(params.id as string);
      setProduct(data);
      
      // Track product view and catalogue view for authenticated users
      if (user) {
        trackProductView(params.id as string);
        if (data.seller_id) {
          trackCatalogueView(data.seller_id);
        }
      }
    } catch (error) {
      console.error("Error loading product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login?redirect=/products/" + params.id);
      return;
    }

    try {
      setSending(true);
      await sendMessage({
        recipient_id: product!.seller_id,
        subject: messageForm.subject || `Inquiry about ${product!.name}`,
        message: messageForm.message,
        message_type: "product_inquiry",
      });
      setMessageModalOpen(false);
      setMessageForm({ subject: "", message: "" });
      alert("Message sent successfully!");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <Link href="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Product Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                {/* Product Images */}
                <div className="aspect-video bg-gray-200 rounded-lg mb-6 flex items-center justify-center">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Package className="h-24 w-24 text-gray-400" />
                  )}
                </div>

                {/* Product Title & Price */}
                <div className="space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                    <div className="flex items-center gap-4">
                      <Badge variant="default">{product.status}</Badge>
                      <span className="text-sm text-gray-600">
                        Stock: {product.stock} units
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-3xl font-bold text-blue-600">
                      ₹{product.price.toFixed(2)}
                    </span>
                    <span className="text-gray-600 ml-2">
                      (Min. Order: {product.min_order_quantity} units)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Product Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {product.description}
                </p>
              </CardContent>
            </Card>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="border-b pb-2">
                        <dt className="text-sm font-medium text-gray-600">{key}</dt>
                        <dd className="text-gray-900">{value as string}</dd>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Seller Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-900">
                    {product.users?.company || product.users?.name || "Company Name"}
                  </p>
                  <p className="text-sm text-gray-600">{product.users?.email}</p>
                  {product.users?.phone && (
                    <p className="text-sm text-gray-600">{product.users.phone}</p>
                  )}
                </div>

                <div className="pt-4 border-t space-y-2">
                  <Button 
                    className="w-full"
                    onClick={() => {
                      if (!user) {
                        router.push("/login?redirect=/products/" + params.id);
                      } else {
                        setMessageModalOpen(true);
                      }
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Seller
                  </Button>
                  
                  {user && (
                    <Link href="/rfq" className="block">
                      <Button variant="outline" className="w-full">
                        Request Quote (RFQ)
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span>Verified Seller</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span>Quality Assured</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <span>Fast Delivery</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      <Modal
        open={messageModalOpen}
        onClose={() => setMessageModalOpen(false)}
        title="Contact Seller"
        description={`Send a message to ${product.users?.company || "the seller"}`}
      >
        <form onSubmit={handleSendMessage} className="space-y-4">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder={`Inquiry about ${product.name}`}
              value={messageForm.subject}
              onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Enter your message..."
              required
              value={messageForm.message}
              onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
              rows={5}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={sending} className="flex-1">
              {sending ? "Sending..." : "Send Message"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setMessageModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
