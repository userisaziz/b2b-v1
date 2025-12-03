"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, MessageSquare, Building2, MapPin, Package, Shield, Star,
  ShoppingCart, Heart, Share2, Tag, Truck, RotateCcw, CheckCircle,
  ChevronRight, Home, ChevronDown, Info, Globe, Award, Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </StorefrontLayout>
    );
  }

  if (!product) {
    return (
      <StorefrontLayout>
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout>
      <div className="bg-gray-50 min-h-screen pb-12">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center text-sm text-gray-500">
              <Link href="/" className="hover:text-blue-600">Home</Link>
              <ChevronRight className="h-4 w-4 mx-2" />
              <Link href="/categories" className="hover:text-blue-600">All Categories</Link>
              {product.category && (
                <>
                  <ChevronRight className="h-4 w-4 mx-2" />
                  <Link href={`/categories/${product.category.id}`} className="hover:text-blue-600">
                    {product.category.name}
                  </Link>
                </>
              )}
              <ChevronRight className="h-4 w-4 mx-2" />
              <span className="text-gray-900 truncate max-w-xs font-medium">{product.name}</span>
            </div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">

              {/* Left Column: Images (4 cols) */}
              <div className="lg:col-span-4 p-6 border-r border-gray-100">
                <div className="aspect-square bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center overflow-hidden mb-4 relative group">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[selectedImage]}
                      alt={product.name}
                      className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <Package className="h-24 w-24 text-gray-300" />
                  )}
                  <div className="absolute top-3 right-3">
                    <Button variant="ghost" size="sm" className="rounded-full bg-white/80 hover:bg-white shadow-sm p-2">
                      <Heart className="h-5 w-5 text-gray-500 hover:text-red-500 transition-colors" />
                    </Button>
                  </div>
                </div>

                {product.images && product.images.length > 1 && (
                  <div className="grid grid-cols-5 gap-2">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-square rounded-md border-2 overflow-hidden ${selectedImage === index ? 'border-blue-600 ring-1 ring-blue-600' : 'border-gray-100 hover:border-gray-300'
                          }`}
                      >
                        <img src={image} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Center Column: Product Details (5 cols) */}
              <div className="lg:col-span-5 p-6 border-r border-gray-100">
                <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{product.name}</h1>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                    <span className="ml-2 text-sm text-gray-500 font-medium text-black">5.0</span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm text-gray-500">24 Orders</span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-gray-900">₹{product.price?.toLocaleString()}</span>
                    <span className="text-sm text-gray-500">/ unit</span>
                  </div>
                  {product.min_order_quantity && (
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Min. Order: <span className="font-semibold">{product.min_order_quantity} units</span>
                    </p>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Key Attributes */}
                  <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm">
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-500">Payment:</span>
                      <span className="font-medium text-gray-900">T/T, L/C, PayPal</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-500">Shipping:</span>
                      <span className="font-medium text-gray-900">Sea, Air, Express</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-500">Lead Time:</span>
                      <span className="font-medium text-gray-900">15 days</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-500">Customization:</span>
                      <span className="font-medium text-gray-900">Available</span>
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-300 rounded-md bg-white">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-3 py-2 text-gray-600 hover:bg-gray-50 border-r border-gray-300"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-20 text-center py-2 focus:outline-none"
                        />
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="px-3 py-2 text-gray-600 hover:bg-gray-50 border-l border-gray-300"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm text-gray-500">
                        {product.stock ? `${product.stock} available` : 'In Stock'}
                      </span>
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-col gap-3 pt-4">
                    <Button
                      className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200"
                      onClick={() => {
                        if (!user) {
                          router.push("/login?redirect=/products/" + params.id);
                        } else {
                          router.push(`/messages?to=${product.seller_id}&subject=Inquiry: ${product.name}`);
                        }
                      }}
                    >
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Contact Supplier
                    </Button>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" className="h-11 border-blue-200 text-blue-700 hover:bg-blue-50">
                        Start Order
                      </Button>
                      <Button variant="outline" className="h-11">
                        Add to Inquiry Cart
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Supplier Info (3 cols) */}
              <div className="lg:col-span-3 p-6 bg-gray-50/50">
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                      {product.users?.company?.charAt(0) || "S"}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 line-clamp-1">
                        {product.users?.company || "Verified Supplier"}
                      </h3>
                      <p className="text-xs text-gray-500">Since 2020</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{product.users?.company || "India"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Award className="h-4 w-4 text-orange-500" />
                      <span>Gold Supplier</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Verified Business</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      Visit Store
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      Follow
                    </Button>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm">Trade Assurance</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Product quality protection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>On-time shipment protection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Payment security</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Tabs: Description, Specs, etc. */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-9">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <Tabs defaultValue="description" className="w-full">
                  <div className="border-b border-gray-200 px-6">
                    <TabsList className="h-14 bg-transparent p-0 space-x-8">
                      <TabsTrigger
                        value="description"
                        className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none bg-transparent px-0 text-base"
                      >
                        Product Description
                      </TabsTrigger>
                      <TabsTrigger
                        value="specs"
                        className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none bg-transparent px-0 text-base"
                      >
                        Specifications
                      </TabsTrigger>
                      <TabsTrigger
                        value="company"
                        className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none bg-transparent px-0 text-base"
                      >
                        Company Profile
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="description" className="p-8 m-0">
                    <div className="prose max-w-none text-gray-700">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Product Overview</h3>
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {product.description || "No description available for this product."}
                      </p>

                      {/* Placeholder for rich content images */}
                      <div className="mt-8 grid grid-cols-2 gap-4">
                        <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center text-gray-400">
                          Product Detail Image 1
                        </div>
                        <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center text-gray-400">
                          Product Detail Image 2
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="specs" className="p-8 m-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Technical Specifications</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <tbody className="divide-y divide-gray-100">
                          {product.specifications && Object.entries(product.specifications).map(([key, value], index) => (
                            <tr key={index} className="bg-white hover:bg-gray-50">
                              <td className="px-6 py-4 font-medium text-gray-900 w-1/3 bg-gray-50/50">{key}</td>
                              <td className="px-6 py-4 text-gray-700">{String(value)}</td>
                            </tr>
                          ))}
                          {!product.specifications && (
                            <tr>
                              <td className="px-6 py-4 text-gray-500 text-center" colSpan={2}>No specifications listed</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>

                  <TabsContent value="company" className="p-8 m-0">
                    <div className="flex items-start gap-6">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <Building2 className="h-10 w-10 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{product.users?.company || "Supplier Company"}</h3>
                        <p className="text-gray-600 mb-4">
                          We are a leading manufacturer specializing in high-quality industrial products.
                          With over 10 years of experience, we serve clients globally with dedication and excellence.
                        </p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="block text-gray-500">Business Type</span>
                            <span className="font-medium">Manufacturer</span>
                          </div>
                          <div>
                            <span className="block text-gray-500">Location</span>
                            <span className="font-medium">{product.users?.company || "India"}</span>
                          </div>
                          <div>
                            <span className="block text-gray-500">Total Employees</span>
                            <span className="font-medium">50-100</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Right Side Recommendations */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="font-bold text-gray-900 mb-4">You May Also Like</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 group cursor-pointer">
                      <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
                        {/* Placeholder */}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600">
                          Similar Product Recommendation {i}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">₹1,200 - ₹1,500</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}