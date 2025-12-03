"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft, Store, User, Mail, Phone, Building, Lock, MapPin,
  CheckCircle, TrendingUp, Globe, Loader2
} from "lucide-react";
import { register } from "@/lib/auth";
import StorefrontLayout from "@/components/layout/StorefrontLayout";
import Image from "next/image";

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

      const sellerData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        companyName: formData.company,
        businessEmail: formData.email,
        businessType: formData.businessType || "manufacturer",
        taxId: formData.taxNumber,
        businessAddress: {
          street: formData.address,
          city: formData.city,
          region: formData.state,
          postalCode: formData.pincode,
          country: "India"
        }
      };

      const response = await register({
        ...sellerData,
        role: 'seller'
      });

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      const isUpgrade = response.user.status === 'pending' && response.user.role === 'seller';

      if (isUpgrade) {
        alert('Your buyer account has been upgraded to a seller account! Your seller account is pending admin approval.');
      } else {
        alert('Registration successful! Your seller account is pending admin approval.');
      }

      window.location.href = process.env.NEXT_PUBLIC_SELLER_URL || 'http://localhost:3001/seller-dashboard/home';
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Registration failed. Please try again.';
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
      <div className="min-h-screen flex bg-white">
        {/* Left Side - Fixed Info Panel */}
        <div className="hidden lg:flex lg:w-5/12 relative bg-slate-900 overflow-hidden flex-col justify-between fixed h-screen">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-slate-900 z-10" />
          <Image
            src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2664&auto=format&fit=crop"
            alt="Seller Dashboard"
            fill
            className="object-cover opacity-40 mix-blend-overlay"
            priority
          />

          <div className="relative z-20 p-12 h-full flex flex-col justify-between">
            <div>
              <Link href="/" className="inline-flex items-center text-sm font-medium text-blue-200 hover:text-white transition-colors mb-12">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Store
              </Link>

              <div className="h-14 w-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-900/50">
                <Store className="h-7 w-7 text-white" />
              </div>

              <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
                Start Selling to <br />
                <span className="text-blue-400">Millions of Buyers</span>
              </h1>

              <p className="text-lg text-slate-300 mb-12 max-w-md">
                Join the fastest growing B2B marketplace. Access powerful tools, analytics, and a nationwide network.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm">
                    <Globe className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Nationwide Reach</h3>
                    <p className="text-sm text-slate-400">Expand your business across the country</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Growth Analytics</h3>
                    <p className="text-sm text-slate-400">Track performance and optimize sales</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm">
                    <CheckCircle className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Verified Badge</h3>
                    <p className="text-sm text-slate-400">Build trust with verified seller status</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-sm text-slate-500">
              © 2024 B2B Market. All rights reserved.
            </div>
          </div>
        </div>

        {/* Right Side - Scrollable Form */}
        <div className="w-full lg:w-7/12 lg:ml-[41.666667%] min-h-screen bg-slate-50">
          <div className="max-w-2xl mx-auto p-8 lg:p-12">
            <div className="lg:hidden mb-8">
              <Link href="/" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Store
              </Link>
            </div>

            <div className="mb-10">
              <h2 className="text-3xl font-bold text-slate-900">Seller Application</h2>
              <p className="mt-2 text-slate-600">Fill in your business details to start selling.</p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-8 flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">Already have a buyer account?</h4>
                <p className="text-sm text-blue-700 leading-relaxed">
                  You can use your existing email to register as a seller. Just enter your current password to upgrade your account.
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

              {/* Personal Info */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
                  <User className="h-5 w-5 text-slate-400" /> Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" name="name" placeholder="John Doe" className="h-11" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" name="email" type="email" placeholder="name@company.com" className="h-11" value={formData.email} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="+91 98765 43210" className="h-11" value={formData.phone} onChange={handleChange} required />
                  </div>
                </div>
              </div>

              {/* Business Info */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Building className="h-5 w-5 text-slate-400" /> Business Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name *</Label>
                    <Input id="company" name="company" placeholder="Your Company Pvt Ltd" className="h-11" value={formData.company} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <Input id="businessType" name="businessType" placeholder="e.g., Manufacturer" className="h-11" value={formData.businessType} onChange={handleChange} />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="taxNumber">GST / Tax Number (Optional)</Label>
                    <Input id="taxNumber" name="taxNumber" placeholder="GSTIN1234567890" className="h-11" value={formData.taxNumber} onChange={handleChange} />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
                  <MapPin className="h-5 w-5 text-slate-400" /> Location
                </h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Textarea id="address" name="address" placeholder="Enter your business address" className="min-h-[80px] resize-none" value={formData.address} onChange={handleChange} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" name="city" placeholder="Mumbai" className="h-11" value={formData.city} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" name="state" placeholder="Maharashtra" className="h-11" value={formData.state} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input id="pincode" name="pincode" placeholder="400001" className="h-11" value={formData.pincode} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Lock className="h-5 w-5 text-slate-400" /> Account Security
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input id="password" name="password" type="password" placeholder="Create a strong password" className="h-11" value={formData.password} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Re-enter your password" className="h-11" value={formData.confirmPassword} onChange={handleChange} required />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all rounded-xl"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Submitting Application...
                    </span>
                  ) : 'Submit Seller Application'}
                </Button>
              </div>

              <div className="text-center text-sm text-slate-600">
                Already have a seller account?{" "}
                <Link href="/seller/login" className="text-blue-600 hover:text-blue-700 font-bold hover:underline">
                  Login to Dashboard
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
