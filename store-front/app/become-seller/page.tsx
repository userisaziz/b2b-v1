"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft, Store, User, Mail, Phone, Building, Lock, MapPin,
  CheckCircle, TrendingUp, Globe, Loader2, ChevronRight, ChevronLeft, Quote
} from "lucide-react";
import { cn } from "@/lib/utils";
import { register } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function BecomeSellerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
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

  const validateStep = (step: number) => {
    setError("");
    switch (step) {
      case 1:
        if (!formData.name || !formData.email || !formData.phone) {
          setError("Please fill in all personal details.");
          return false;
        }
        return true;
      case 2:
        if (!formData.company) {
          setError("Company Name is required.");
          return false;
        }
        return true;
      case 3:
        if (!formData.address || !formData.city || !formData.state || !formData.pincode) {
          setError("Please fill in all location details.");
          return false;
        }
        return true;
      case 4:
        if (!formData.password || !formData.confirmPassword) {
          setError("Please create a password.");
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match.");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setError("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    try {
      setLoading(true);
      await register({
        ...formData,
        role: 'seller'
      });
      alert('Registration successful! Your seller account is pending admin approval.');
      router.push('/seller/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: "Personal", icon: User },
    { id: 2, title: "Business", icon: Building },
    { id: 3, title: "Location", icon: MapPin },
    { id: 4, title: "Security", icon: Lock },
  ];

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Fixed Info Panel */}
      <div className="hidden lg:block lg:w-5/12 fixed left-0 top-0 h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-12 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=2000&auto=format&fit=crop')" }} />

        <div className="relative z-10 h-full flex flex-col justify-between">
          <div>
            <a href="/" className="inline-flex items-center text-sm font-medium text-blue-200 hover:text-white transition-colors mb-12">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Store
            </a>

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

            {/* Testimonial */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
              <Quote className="h-8 w-8 text-blue-400 mb-4 opacity-50" />
              <p className="text-white/90 italic mb-4 leading-relaxed">
                "Since joining B2B Market, our wholesale orders have increased by 200%. The platform is intuitive and the support is fantastic."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                  RS
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Rahul Sharma</p>
                  <p className="text-blue-200 text-xs">CEO, TechExports India</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm text-slate-400">
            © 2024 B2B Market. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side - Scrollable Form */}
      <div className="w-full lg:w-7/12 lg:ml-[41.666667%] min-h-screen bg-slate-50">
        <div className="max-w-2xl mx-auto p-8 lg:p-12">
          <div className="lg:hidden mb-8">
            <a href="/" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Store
            </a>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Seller Application</h2>
            <p className="mt-2 text-slate-600">Complete the steps below to start your journey.</p>
          </div>

          {/* Progress Stepper */}
          <div className="mb-10">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200" style={{ zIndex: 0 }} />
              <div
                className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-600 transition-all duration-500 ease-in-out"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`, zIndex: 0 }}
              />

              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;

                return (
                  <div key={step.id} className="flex flex-col items-center gap-2 bg-slate-50 px-2 relative z-10">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                        isActive ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-110" :
                          isCompleted ? "border-blue-600 bg-blue-600 text-white" :
                            "border-slate-300 bg-white text-slate-400"
                      )}
                    >
                      {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <span className={cn(
                      "text-xs font-semibold transition-colors duration-300",
                      isActive ? "text-blue-600" : isCompleted ? "text-blue-600" : "text-slate-400"
                    )}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2" />
                  {error}
                </div>
              )}

              {/* Step 1: Personal Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
                      <p className="text-sm text-slate-500">Tell us about yourself</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input id="name" name="name" placeholder="John Doe" className="h-11" value={formData.name} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input id="email" name="email" type="email" placeholder="name@company.com" className="h-11" value={formData.email} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input id="phone" name="phone" type="tel" placeholder="+91 98765 43210" className="h-11" value={formData.phone} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="h-3 w-3 text-blue-600" />
                    </div>
                    <p className="text-sm text-blue-700">
                      Already have a buyer account? Use the same email to upgrade your account instantly.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Business Info */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <Building className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Business Details</h3>
                      <p className="text-sm text-slate-500">Tell us about your company</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name *</Label>
                      <Input id="company" name="company" placeholder="Your Company Pvt Ltd" className="h-11" value={formData.company} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type</Label>
                      <Input id="businessType" name="businessType" placeholder="e.g., Manufacturer, Wholesaler" className="h-11" value={formData.businessType} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxNumber">GST / Tax Number (Optional)</Label>
                      <Input id="taxNumber" name="taxNumber" placeholder="GSTIN1234567890" className="h-11" value={formData.taxNumber} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Location */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Location</h3>
                      <p className="text-sm text-slate-500">Where is your business located?</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Street Address</Label>
                      <Textarea id="address" name="address" placeholder="Enter your business address" className="min-h-[80px] resize-none" value={formData.address} onChange={handleChange} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" name="city" placeholder="Mumbai" className="h-11" value={formData.city} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input id="state" name="state" placeholder="Maharashtra" className="h-11" value={formData.state} onChange={handleChange} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="pincode">Pincode</Label>
                        <Input id="pincode" name="pincode" placeholder="400001" className="h-11" value={formData.pincode} onChange={handleChange} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Security */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Account Security</h3>
                      <p className="text-sm text-slate-500">Secure your account</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input id="password" name="password" type="password" placeholder="Create a strong password" className="h-11" value={formData.password} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Re-enter your password" className="h-11" value={formData.confirmPassword} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-yellow-800 mb-1">Important Note</h4>
                    <p className="text-sm text-yellow-700">
                      By clicking Submit, you agree to our Terms of Service and Privacy Policy. Your application will be reviewed by our team within 24 hours.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-8">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 1 || loading}
                  className="px-4 py-2 text-slate-500 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" /> Back
                </button>

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-xl flex items-center transition-colors"
                  >
                    Next Step <ChevronRight className="h-4 w-4 ml-2" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-xl shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                      </span>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-slate-600 mt-8">
            Already have a seller account?{" "}
            <a href="/seller/login" className="text-blue-600 hover:text-blue-700 font-bold hover:underline">
              Login to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}