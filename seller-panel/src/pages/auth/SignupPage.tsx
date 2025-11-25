import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signupSeller } from "@/services/auth.service";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Select, SelectItem } from "../../components/ui/select";

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string(),
    phone: z.string().min(10, {
        message: "Please enter a valid phone number.",
    }),
    companyName: z.string().min(2, {
        message: "Company name must be at least 2 characters.",
    }),
    businessType: z.string().min(1, {
        message: "Please select a business type.",
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export default function SignupPage() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
            companyName: "",
            businessType: "",
        },
    });
    
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        setError(null);
        try {
            const response = await signupSeller({
                name: values.name,
                email: values.email,
                password: values.password,
                phone: values.phone,
                companyName: values.companyName,
                businessType: values.businessType,
            });
            // Store token in localStorage
            localStorage.setItem('sellerToken', response.token);
            // Redirect to dashboard
            navigate('/dashboard');
        } catch (err: any) {
            console.error("Signup error:", err);
            setError(err.response?.data?.message || "Failed to create account. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className="border-0 shadow-none sm:border sm:shadow-sm">
            <CardHeader>
                <CardTitle className="text-2xl">Seller Sign Up</CardTitle>
                <CardDescription>
                    Enter your information to create a seller account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {error && (
                            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="m@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+966 50 123 4567" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Your Company Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="businessType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Business Type</FormLabel>
                                    <FormControl>
                                        <Select {...field}>
                                            <option value="">Select business type</option>
                                            <SelectItem value="manufacturer">Manufacturer</SelectItem>
                                            <SelectItem value="distributor">Distributor</SelectItem>
                                            <SelectItem value="retailer">Retailer</SelectItem>
                                            <SelectItem value="wholesaler">Wholesaler</SelectItem>
                                            <SelectItem value="trading_establishment">Trading Establishment</SelectItem>
                                            <SelectItem value="importer">Importer</SelectItem>
                                            <SelectItem value="service_provider">Service Provider</SelectItem>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </Button>
                    </form>
                </Form>
                <div className="mt-4 text-center text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="underline">
                        Login
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}