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
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Tag,
  Truck,
  RotateCcw,
  CheckCircle,
  ChevronRight,
  Home,
  ChevronDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StorefrontLayout from "@/components/layout/StorefrontLayout";
import { getProductById, Product } from "@/lib/storefront";
import { getCurrentUser } from "@/lib/auth";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const user = getCurrentUser();

  useEffect(() => {
    loadProduct();
  }, [params.id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      // Check if the ID is valid before making the request
      if (!params.id || params.id === 'undefined') {
        console.error("Invalid product ID");
        return;
      }
      const data = await getProductById(params.id as string);
      setProduct(data);
    } catch (error) {
      console.error("Error loading product:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StorefrontLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="h-96 bg-gray-200 rounded"></div>
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </StorefrontLayout>
    );
  }

  if (!product) {
    return (
      <StorefrontLayout>
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
      </StorefrontLayout>
    );
  }

  // Breadcrumb component
  const Breadcrumb = () => (
    <div className="flex items-center text-sm text-gray-500 mb-6">
      <Link href="/" className="hover:text-blue-600">Home</Link>
      <ChevronRight className="h-4 w-4 mx-2" />
      {product.category && (
        <>
          <Link href={`/categories/${product.category.id}`} className="hover:text-blue-600">
            {product.category.name}
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
        </>
      )}
      <span className="text-gray-900 truncate max-w-xs">{product.name}</span>
    </div>
  );

  // Image gallery component
  const ImageGallery = () => (
    <div className="space-y-4">
      {/* Main image */}
      <div className="aspect-square bg-white rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img 
            src={product.images[selectedImage]} 
            alt={product.name}
            className="w-full h-full object-contain p-4"
          />
        ) : (
          <Package className="h-24 w-24 text-gray-400" />
        )}
      </div>
      
      {/* Thumbnail images */}
      {product.images && product.images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {product.images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-md border-2 overflow-hidden ${
                selectedImage === index ? 'border-blue-500' : 'border-gray-200'
              }`}
            >
              <img 
                src={image} 
                alt={`${product.name} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Product info component
  const ProductInfo = () => (
    <div className="space-y-6">
      {/* Product title and rating */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">(0 reviews)</span>
          </div>
          <Badge variant="secondary">SKU: {product.sku || 'N/A'}</Badge>
        </div>
      </div>

      {/* Price and stock info */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-600">Price</p>
            <p className="text-3xl font-bold text-blue-600">
              ₹{product.price?.toLocaleString() || 'N/A'}
            </p>
            {product.min_order_quantity && (
              <p className="text-sm text-gray-600">
                Min. Order: {product.min_order_quantity} units
              </p>
            )}
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-600">In Stock</p>
            <p className="text-2xl font-bold text-green-600">
              {product.stock?.toLocaleString() || 0} units
            </p>
          </div>
        </div>
      </div>

      {/* Quantity selector */}
      <div className="flex items-center gap-4">
        <span className="text-gray-700 font-medium">Quantity:</span>
        <div className="flex items-center border border-gray-300 rounded-md">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-2 text-gray-600 hover:bg-gray-100"
          >
            -
          </button>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-16 text-center border-x border-gray-300 py-2"
          />
          <button 
            onClick={() => setQuantity(quantity + 1)}
            className="px-3 py-2 text-gray-600 hover:bg-gray-100"
          >
            +
          </button>
        </div>
        <span className="text-gray-600">units</span>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <Button className="flex-1 min-w-[150px]">
          <ShoppingCart className="h-5 w-5 mr-2" />
          Add to Cart
        </Button>
        <Button variant="outline" size="icon">
          <Heart className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="icon">
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );

  // Product specifications
  const ProductSpecifications = () => {
    // Convert specifications to array for display
    const specsArray = product.specifications ? Object.entries(product.specifications) : [];
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Product Specifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {specsArray.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {specsArray.map(([key, value], index) => (
                <div key={index} className="border-b border-gray-100 pb-3 last:border-0">
                  <dt className="text-sm font-medium text-gray-600 capitalize">{key}</dt>
                  <dd className="text-gray-900 mt-1">{String(value)}</dd>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No specifications available for this product.</p>
          )}
        </CardContent>
      </Card>
    );
  };

  // Shipping and returns
  const ShippingInfo = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Shipping & Returns
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <Truck className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium">Free Shipping</p>
            <p className="text-sm text-gray-600">For orders over ₹5000</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <RotateCcw className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium">Easy Returns</p>
            <p className="text-sm text-gray-600">30-day return policy</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium">Quality Guaranteed</p>
            <p className="text-sm text-gray-600">100% authentic products</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Seller info
  const SellerInfo = () => (
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

        <div className="pt-4 border-t space-y-3">
          <Button 
            className="w-full"
            onClick={() => {
              if (!user) {
                router.push("/login?redirect=/products/" + params.id);
              } else {
                // Redirect to messages page with seller ID
                router.push(`/messages?to=${product.seller_id}&subject=Inquiry about ${encodeURIComponent(product.name)}`);
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
  );

  // Trust badges
  const TrustBadges = () => (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <Shield className="h-5 w-5 text-green-600" />
            <span>Verified Seller</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Star className="h-5 w-5 text-yellow-500" />
            <span>Quality Assured</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Truck className="h-5 w-5 text-blue-600" />
            <span>Fast Delivery</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>100% Authentic</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <StorefrontLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <Breadcrumb />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Product Images */}
            <div className="lg:col-span-1">
              <ImageGallery />
            </div>
            
            {/* Product Info */}
            <div className="lg:col-span-1">
              <ProductInfo />
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              <SellerInfo />
              <ShippingInfo />
              <TrustBadges />
            </div>
          </div>
          
          {/* Product Description and Specifications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Product Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {product.description || "No description available for this product."}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Specifications */}
            <ProductSpecifications />
          </div>
          
          {/* Category Tags */}
          {product.category && (
            <div className="mt-12">
              <Card>
                <CardHeader>
                  <CardTitle>Category Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-sm py-1 px-3">
                      {product.category.name}
                    </Badge>
                    {product.categories && (
                      <Badge variant="outline" className="text-sm py-1 px-3">
                        {product.categories.name}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </StorefrontLayout>
  );
}