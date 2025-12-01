"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Store,
  User,
  Mail,
  Phone,
  Building,
  Lock,
  MapPin,
  Briefcase,
  CheckCircle,
  TrendingUp,
  Users,
  Globe,
  Loader2
} from "lucide-react";
import { register } from "@/lib/auth";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import StorefrontLayout from "@/components/layout/StorefrontLayout";

export default function BecomeSellerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    businessType: "",
    taxNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      
      // Prepare data to match backend seller model
      const sellerData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        companyName: formData.company,
        businessEmail: formData.email, // Using same email for business email
        businessType: formData.businessType || "manufacturer", // Default to manufacturer if not provided
        taxId: formData.taxNumber,
        businessAddress: {
          street: formData.address,
          city: formData.city,
          region: formData.state,
          postalCode: formData.pincode,
          country: "India" // Default country, can be made dynamic
        }
      };

      const response = await register({
        ...sellerData,
        role: 'seller' as 'seller' | 'buyer' | undefined
      });

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Check if it was an upgrade or new registration
      const isUpgrade = response.user.status === 'pending' && response.user.role === 'seller';

      if (isUpgrade) {
        alert('Your buyer account has been upgraded to a seller account! Your seller account is pending admin approval. You will be notified once approved.');
      } else {
        alert('Registration successful! Your seller account is pending admin approval. You will be notified once approved.');
      }

      window.location.href = process.env.NEXT_PUBLIC_SELLER_URL || 'http://localhost:3001/seller-dashboard/home';
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Registration failed. Please try again.';

      // Provide helpful message if password is wrong for existing account
      if (errorMsg.includes('Invalid password')) {
        setError('You already have a buyer account with this email. Please use the same password to upgrade to a seller account.');
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <StorefrontLayout>
      <div className="min-h-screen bg-slate-50">
        {/* Hero Section */}
        <div className="relative bg-slate-900 text-white py-24 overflow-hidden">
          {/* Abstract Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-[30%] -right-[10%] w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-[30%] -left-[10%] w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/" className="inline-flex items-center text-sm text-slate-300 hover:text-white mb-8 transition-colors group">
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  Join 10,000+ Sellers
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                  Grow Your Business on <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">B2B Market</span>
                </h1>
                <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                  Connect with verified buyers, manage RFQs, and scale your B2B operations with our comprehensive seller tools.
                </p>

                {/* Benefits */}
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                      <Globe className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-white">Nationwide Reach</h3>
                      <p className="text-slate-400">Access verified buyers from across the country instantly.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                      <TrendingUp className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-white">Smart Analytics</h3>
                      <p className="text-slate-400">Track performance and insights to optimize your sales.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                      <CheckCircle className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-white">Zero Commission</h3>
                      <p className="text-slate-400">Keep 100% of your earnings with our subscription model.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-20 transform rotate-6"></div>
                <div className="relative bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700 shadow-2xl">
                  <div className="grid grid-cols-2 gap-6 text-center">
                    <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700">
                      <Store className="h-10 w-10 mx-auto mb-3 text-blue-400" />
                      <div className="text-3xl font-bold text-white mb-1">10k+</div>
                      <div className="text-sm text-slate-400">Active Sellers</div>
                    </div>
                    <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700">
                      <Users className="h-10 w-10 mx-auto mb-3 text-purple-400" />
                      <div className="text-3xl font-bold text-white mb-1">25k+</div>
                      <div className="text-sm text-slate-400">Verified Buyers</div>
                    </div>
                    <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700">
                      <Briefcase className="h-10 w-10 mx-auto mb-3 text-emerald-400" />
                      <div className="text-3xl font-bold text-white mb-1">1k+</div>
                      <div className="text-sm text-slate-400">Daily RFQs</div>
                    </div>
                    <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700">
                      <Globe className="h-10 w-10 mx-auto mb-3 text-amber-400" />
                      <div className="text-3xl font-bold text-white mb-1">50k+</div>
                      <div className="text-sm text-slate-400">Products</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-24">
          <Card className="shadow-2xl border-0 ring-1 ring-slate-900/5 bg-white">
            <CardHeader className="text-center pb-8 pt-10 border-b border-slate-100">
              <div className="mx-auto mb-6 h-16 w-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Store className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900">Seller Application</CardTitle>
              <CardDescription className="text-slate-500 mt-2">
                Fill in your business details to start selling
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 md:p-10">
              {/* Info Box for Existing Buyers */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-8 flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Already have a buyer account?</h4>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    You can use your existing email to register as a seller. Just enter your current password to upgrade your account. You'll retain access to all buyer features.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center animate-in fade-in slide-in-from-top-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2" />
                    {error}
                  </div>
                )}

                {/* Personal Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Personal Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all rounded-xl"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@company.com"
                        className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all rounded-xl"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all rounded-xl"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Business Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                    <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center">
                      <Building className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Business Details</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label htmlFor="company" className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Company Name *</Label>
                      <Input
                        id="company"
                        name="company"
                        placeholder="Your Company Pvt Ltd"
                        className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all rounded-xl"
                        value={formData.company}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="businessType" className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Business Type</Label>
                      <Input
                        id="businessType"
                        name="businessType"
                        placeholder="e.g., Manufacturer, Trader"
                        className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all rounded-xl"
                        value={formData.businessType}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <Label htmlFor="taxNumber" className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">GST / Tax Number (Optional)</Label>
                      <Input
                        id="taxNumber"
                        name="taxNumber"
                        placeholder="GSTIN1234567890"
                        className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all rounded-xl"
                        value={formData.taxNumber}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Location</h3>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <Label htmlFor="address" className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Street Address</Label>
                      <Textarea
                        id="address"
                        name="address"
                        placeholder="Enter your business address"
                        className="min-h-[80px] bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all rounded-xl resize-none"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-1.5">
                        <Label htmlFor="city" className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">City</Label>
                        <Input
                          id="city"
                          name="city"
                          placeholder="Mumbai"
                          className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all rounded-xl"
                          value={formData.city}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="state" className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">State</Label>
                        <Input
                          id="state"
                          name="state"
                          placeholder="Maharashtra"
                          className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all rounded-xl"
                          value={formData.state}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="pincode" className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Pincode</Label>
                        <Input
                          id="pincode"
                          name="pincode"
                          placeholder="400001"
                          className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all rounded-xl"
                          value={formData.pincode}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                    <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Account Security</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Password *</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Create a strong password"
                        className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all rounded-xl"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Confirm Password *</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Re-enter your password"
                        className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all rounded-xl"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-3">
                  <input type="checkbox" required className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <label className="text-sm text-slate-600">
                    I agree to the <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">Terms & Conditions</Link> and <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">Privacy Policy</Link>. I understand that my account will be reviewed and approved by the admin team.
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-600/20 hover:shadow-blue-600/30 transition-all duration-300 rounded-xl"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Submitting Application...
                    </span>
                  ) : 'Submit Seller Application'}
                </Button>

                <div className="text-center text-sm text-slate-600">
                  Already have an account?{" "}
                  <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold hover:underline">
                    Login here
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </StorefrontLayout>
  );
}
