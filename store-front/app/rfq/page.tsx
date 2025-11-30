"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { postRFQ, getCategories, Category } from "@/lib/storefront";
import { getCurrentUser } from "@/lib/auth";
import StorefrontLayout from "@/components/layout/StorefrontLayout";

interface RFQFormData {
  category_id: string;
  title: string;
  description: string;
  quantity: string;
  budget_min: string;
  budget_max: string;
  deadline: string;
  delivery_location: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
}

export default function RFQPage() {
  const router = useRouter();
  const user = getCurrentUser();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<RFQFormData>({
    category_id: "",
    title: "",
    description: "",
    quantity: "",
    budget_min: "",
    budget_max: "",
    deadline: "",
    delivery_location: "",
    contact_name: user?.name || "",
    contact_email: user?.email || "",
    contact_phone: ""
  });

  useEffect(() => {
    if (!user) {
      // Pre-fill with any stored contact info from localStorage if available
      const savedContactInfo = localStorage.getItem('rfq_contact_info');
      if (savedContactInfo) {
        try {
          const contactInfo = JSON.parse(savedContactInfo);
          setFormData(prev => ({
            ...prev,
            contact_name: contactInfo.contact_name || "",
            contact_email: contactInfo.contact_email || "",
            contact_phone: contactInfo.contact_phone || ""
          }));
        } catch (e) {
          console.error("Error parsing saved contact info:", e);
        }
      }
    }
    
    // Load categories once when user is available
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        console.log('Categories loaded:', data);
        setCategories(data);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    
    loadCategories();
  }, []); // Empty dependency array - only run once on mount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.category_id || !formData.title || !formData.description || 
        !formData.contact_name || !formData.contact_email || !formData.contact_phone) {
      setError('Please fill in all required fields (Category, Title, Description, Name, Email, Phone)');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Submitting RFQ:', formData); // Debug log
      
      await postRFQ({
        category_id: formData.category_id,
        title: formData.title,
        description: formData.description,
        quantity: formData.quantity ? parseInt(formData.quantity) : undefined,
        budget_min: formData.budget_min ? parseFloat(formData.budget_min) : undefined,
        budget_max: formData.budget_max ? parseFloat(formData.budget_max) : undefined,
        deadline: formData.deadline || undefined,
        delivery_location: formData.delivery_location,
        contact_name: formData.contact_name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone
      });
      
      // Save contact info for future use
      localStorage.setItem('rfq_contact_info', JSON.stringify({
        contact_name: formData.contact_name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone
      }));
      
      alert("RFQ posted successfully! Sellers will contact you soon.");
      router.push("/my-account");
    } catch (error: any) {
      console.error('Error posting RFQ:', error); // Debug log
      const errorMessage = error.response?.data?.message || error.message || "Failed to post RFQ";
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!user) {
    return (
      <StorefrontLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-6 w-6" />
                Post Request for Quote (RFQ)
              </CardTitle>
              <CardDescription>
                Submit your requirements and receive quotes from verified sellers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Error Alert */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category */}
                <div>
                  <Label htmlFor="category_id">Category *</Label>
                  <select
                    id="category_id"
                    name="category_id"
                    required
                    value={formData.category_id}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => {
                      // Main category
                      const items = [
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ];
                      
                      // Add subcategories if they exist
                      if (cat.subcategories && cat.subcategories.length > 0) {
                        cat.subcategories.forEach((sub) => {
                          items.push(
                            <option key={sub.id} value={sub.id}>
                              {cat.name} → {sub.name}
                            </option>
                          );
                        });
                      }
                      
                      return items;
                    })}
                  </select>
                  {categories.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Loading categories...
                    </p>
                  )}
                </div>

                {/* Title */}
                <div>
                  <Label htmlFor="title">RFQ Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    required
                    placeholder="e.g., Need 1000 units of Industrial Machinery"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Detailed Requirements *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    required
                    placeholder="Describe your requirements in detail..."
                    rows={6}
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_name">Full Name *</Label>
                    <Input
                      id="contact_name"
                      name="contact_name"
                      required
                      placeholder="John Doe"
                      value={formData.contact_name}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_email">Email Address *</Label>
                    <Input
                      id="contact_email"
                      name="contact_email"
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={formData.contact_email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="contact_phone">Phone Number *</Label>
                  <Input
                    id="contact_phone"
                    name="contact_phone"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.contact_phone}
                    onChange={handleChange}
                  />
                </div>

                {/* Quantity and Budget */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      placeholder="e.g., 1000"
                      value={formData.quantity}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="delivery_location">Delivery Location</Label>
                    <Input
                      id="delivery_location"
                      name="delivery_location"
                      placeholder="e.g., Mumbai, Maharashtra"
                      value={formData.delivery_location}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Budget Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget_min">Minimum Budget (₹)</Label>
                    <Input
                      id="budget_min"
                      name="budget_min"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 50000"
                      value={formData.budget_min}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="budget_max">Maximum Budget (₹)</Label>
                    <Input
                      id="budget_max"
                      name="budget_max"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 100000"
                      value={formData.budget_max}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Deadline */}
                <div>
                  <Label htmlFor="deadline">Response Deadline</Label>
                  <Input
                    id="deadline"
                    name="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={handleChange}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    <Send className="h-4 w-4 mr-2" />
                    {loading ? "Posting..." : "Post RFQ"}
                  </Button>
                  <Link href="/" className="flex-1">
                    <Button type="button" variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <FileText className="h-6 w-6" />
              Post Request for Quote (RFQ)
            </CardTitle>
            <CardDescription>
              Submit your requirements and receive quotes from verified sellers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Error Alert */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category */}
              <div>
                <Label htmlFor="category_id">Category *</Label>
                <select
                  id="category_id"
                  name="category_id"
                  required
                  value={formData.category_id}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => {
                    // Main category
                    const items = [
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ];
                    
                    // Add subcategories if they exist
                    if (cat.subcategories && cat.subcategories.length > 0) {
                      cat.subcategories.forEach((sub) => {
                        items.push(
                          <option key={sub.id} value={sub.id}>
                            {cat.name} → {sub.name}
                          </option>
                        );
                      });
                    }
                    
                    return items;
                  })}
                </select>
                {categories.length === 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Loading categories...
                  </p>
                )}
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title">RFQ Title *</Label>
                <Input
                  id="title"
                  name="title"
                  required
                  placeholder="e.g., Need 1000 units of Industrial Machinery"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Detailed Requirements *</Label>
                <Textarea
                  id="description"
                  name="description"
                  required
                  placeholder="Describe your requirements in detail..."
                  rows={6}
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              {/* Quantity and Budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    placeholder="e.g., 1000"
                    value={formData.quantity}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="delivery_location">Delivery Location</Label>
                  <Input
                    id="delivery_location"
                    name="delivery_location"
                    placeholder="e.g., Mumbai, Maharashtra"
                    value={formData.delivery_location}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Budget Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget_min">Minimum Budget (₹)</Label>
                  <Input
                    id="budget_min"
                    name="budget_min"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 50000"
                    value={formData.budget_min}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="budget_max">Maximum Budget (₹)</Label>
                  <Input
                    id="budget_max"
                    name="budget_max"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 100000"
                    value={formData.budget_max}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Deadline */}
              <div>
                <Label htmlFor="deadline">Response Deadline</Label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleChange}
                />
              </div>

              {/* Contact Information (pre-filled for logged-in users) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_name">Full Name</Label>
                  <Input
                    id="contact_name"
                    name="contact_name"
                    required
                    placeholder="John Doe"
                    value={formData.contact_name}
                    onChange={handleChange}
                    readOnly={!!user}
                  />
                </div>
                <div>
                  <Label htmlFor="contact_email">Email Address</Label>
                  <Input
                    id="contact_email"
                    name="contact_email"
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={formData.contact_email}
                    onChange={handleChange}
                    readOnly={!!user}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="contact_phone">Phone Number</Label>
                <Input
                  id="contact_phone"
                  name="contact_phone"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.contact_phone}
                  onChange={handleChange}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? "Posting..." : "Post RFQ"}
                </Button>
                <Link href="/" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </StorefrontLayout>
  );
}