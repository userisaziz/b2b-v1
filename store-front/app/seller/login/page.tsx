"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Lock, Mail, Loader2, Store } from "lucide-react";
import { login } from "@/lib/auth";
import StorefrontLayout from "@/components/layout/StorefrontLayout";
import Image from "next/image";

export const dynamic = 'force-dynamic';

function SellerLoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            setLoading(true);
            // Hardcoded role as 'seller' for this page
            const response = await login({ email, password, role: 'seller' });

            // Store token and user data
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));

            // Redirect to Seller Panel
            const sellerUrl = process.env.NEXT_PUBLIC_SELLER_URL || 'http://localhost:5175';
            window.location.href = sellerUrl;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side - Image/Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 to-blue-900/90 z-10" />
                <Image
                    src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2670&auto=format&fit=crop"
                    alt="Seller Dashboard"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="relative z-20 flex flex-col justify-between h-full p-12 text-white">
                    <div>
                        <Link href="/" className="inline-flex items-center text-sm font-medium text-purple-100 hover:text-white transition-colors">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Store
                        </Link>
                    </div>
                    <div className="space-y-6 max-w-lg">
                        <div className="h-12 w-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                            <Store className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold leading-tight">Grow Your Business with B2B Market</h1>
                        <p className="text-lg text-purple-100">Access powerful tools, analytics, and a nationwide network of verified buyers.</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-purple-200">
                        <span>© 2024 B2B Market</span>
                        <span className="h-1 w-1 rounded-full bg-purple-400" />
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <span className="h-1 w-1 rounded-full bg-purple-400" />
                        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="lg:hidden mb-8">
                        <Link href="/" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Store
                        </Link>
                    </div>

                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-900">Seller Login</h2>
                        <p className="mt-2 text-slate-600">Access your seller dashboard.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center animate-in fade-in slide-in-from-top-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <Input
                                        type="email"
                                        placeholder="name@company.com"
                                        className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-purple-500 transition-all rounded-xl"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-semibold text-slate-700">Password</label>
                                    <Link href="/forgot-password" className="text-sm font-medium text-purple-600 hover:text-purple-700 hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-purple-500 transition-all rounded-xl"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 text-base font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20 transition-all rounded-xl"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Signing in...
                                </span>
                            ) : 'Sign In to Dashboard'}
                        </Button>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-4 text-slate-400 font-medium tracking-wider">New to B2B Market?</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button type="button" variant="outline" className="h-12 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-medium" onClick={() => router.push('/become-seller')}>
                                Become a Seller
                            </Button>
                            <Button type="button" variant="outline" className="h-12 rounded-xl border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-medium" onClick={() => router.push('/login')}>
                                Buyer Login
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function SellerLoginPage() {
    return (
        <StorefrontLayout>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>}>
                <SellerLoginForm />
            </Suspense>
        </StorefrontLayout>
    );
}
