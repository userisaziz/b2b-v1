"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Package, User, Mail, Phone, Building, Lock, Loader2 } from "lucide-react";
import { register } from "@/lib/auth";
import { setSupabaseSession } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    password: "",
    confirmPassword: "",
    role: "buyer" // Default role
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const response = await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        company: formData.company,
        role: formData.role as 'buyer' | 'seller'
      });

      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Set Supabase session for WebSocket authentication
      if (response.supabaseSession) {
        await setSupabaseSession(response.supabaseSession);
      }

      // Show success message
      if (response.user.role === 'seller') {
        toast.success('Registration successful! Your seller account is pending approval.');
        setTimeout(() => {
          const sellerUrl = process.env.NEXT_PUBLIC_SELLER_URL || 'http://localhost:5175';
          window.location.href = sellerUrl;
        }, 1000);
      } else {
        toast.success('Registration successful!');
        setTimeout(() => {
          router.push('/');
        }, 1000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-white to-white flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-400/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        <Link href="/" className="inline-flex items-center text-sm text-slate-600 hover:text-blue-600 mb-8 font-medium transition-colors group">
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Store
        </Link>

        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl ring-1 ring-slate-900/5">
          <CardHeader className="text-center pb-6 pt-8">
            <div className="mx-auto mb-6 h-16 w-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <Package className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Create Account</CardTitle>
            <CardDescription className="text-slate-500 mt-2">Join India's largest B2B marketplace</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-10">
            <form onSubmit={handleRegister} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center animate-in fade-in slide-in-from-top-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2" />
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Full Name *</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    name="name"
                    placeholder="John Doe"
                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all duration-200 rounded-xl"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Email *</label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      name="email"
                      type="email"
                      placeholder="name@company.com"
                      className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all duration-200 rounded-xl"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Phone *</label>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      name="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all duration-200 rounded-xl"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Company Name (Optional)</label>
                <div className="relative group">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    name="company"
                    placeholder="Your Company Pvt Ltd"
                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all duration-200 rounded-xl"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Account Type *</label>
                <div className="relative">
                  <select
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleChange}
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus:bg-white transition-all appearance-none"
                  >
                    <option value="buyer">Buyer - I want to purchase products</option>
                    <option value="seller">Seller - I want to sell products</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                  </div>
                </div>
                {formData.role === 'seller' && (
                  <p className="text-xs text-blue-600 mt-1 ml-1 font-medium">Note: Seller accounts require admin approval.</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Password *</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      name="password"
                      type="password"
                      placeholder="Create password"
                      className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all duration-200 rounded-xl"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Confirm Password *</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm password"
                      className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all duration-200 rounded-xl"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start pt-2">
                <input type="checkbox" required className="mr-3 mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <label className="text-sm text-slate-600">
                  I agree to the <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">Terms & Conditions</Link> and <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">Privacy Policy</Link>
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all duration-300 rounded-xl mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating Account...
                  </span>
                ) : 'Create Account'}
              </Button>

              <div className="text-center text-sm pt-4 text-slate-600">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold hover:underline">
                  Sign In
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
