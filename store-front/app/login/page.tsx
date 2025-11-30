"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Package, Lock, Mail, Loader2 } from "lucide-react";
import { login } from "@/lib/auth";
import { setSupabaseSession } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const response = await login({ email, password, role });

      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Configure Supabase WebSocket authentication
      if (response.supabaseSession) {
        await setSupabaseSession(response.supabaseSession);
      }

      // Redirect based on user role
      if (response.user.role === 'admin') {
        // For admin, redirect to admin panel (assuming it's a separate app)
        const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:5173';
        window.location.href = adminUrl;
      } else if (response.user.role === 'seller') {
        // For seller, redirect to seller panel
        const sellerUrl = process.env.NEXT_PUBLIC_SELLER_URL || 'http://localhost:5175';
        window.location.href = sellerUrl;
      } else {
        router.push(redirect);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-white to-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-400/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="inline-flex items-center text-sm text-slate-600 hover:text-blue-600 mb-8 font-medium transition-colors group">
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Store
        </Link>

        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl ring-1 ring-slate-900/5">
          <CardHeader className="text-center pb-8 pt-10">
            <div className="mx-auto mb-6 h-16 w-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <Package className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Welcome Back</CardTitle>
            <CardDescription className="text-slate-500 mt-2">Sign in to access your account</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-10">
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center animate-in fade-in slide-in-from-top-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2" />
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all duration-200 rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Password</label>
                  <Link href="/forgot-password" className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 transition-all duration-200 rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition-all duration-300 rounded-xl"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Signing in...
                    </span>
                  ) : 'Sign In'}
                </Button>
              </div>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-slate-400 font-medium tracking-wider">Or continue with</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Account Type</label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'buyer' | 'seller')}
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus:bg-white transition-all appearance-none"
                  >
                    <option value="buyer">Buyer - I want to purchase products</option>
                    <option value="seller">Seller - I want to sell products</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button type="button" variant="outline" className="h-11 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-medium" onClick={() => router.push('/')}>
                  Guest Access
                </Button>
                <Button type="button" variant="outline" className="h-11 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-medium" onClick={() => router.push('/register')}>
                  Create Account
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-8">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">Terms</Link>
          {" "}and{" "}
          <Link href="/privacy" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
