import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { useNavigate } from "react-router-dom";
import { login } from "@/services/auth.service";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const formSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters.",
    }),
});

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login: authLogin } = useAuth();
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await login({
                email: values.email,
                password: values.password
            });
            
            if (response.success && response.token) {
                // Check if the user is an admin
                if (response.data?.userType === "admin") {
                    // Store the token and user type in the auth context
                    authLogin(response.token, response.data.userType);
                    // Redirect to dashboard
                    navigate("/dashboard");
                } else {
                    setError("You don't have permission to access the admin panel.");
                }
            } else {
                setError(response.message || "Login failed. Please try again.");
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="border-0 shadow-none sm:border sm:shadow-sm max-w-md mx-auto mt-10">
            <CardHeader>
                <CardTitle className="text-2xl">Admin Login</CardTitle>
                <CardDescription>
                    Enter your email and password to access the admin panel
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center gap-2 mb-4" role="alert">
                        <AlertCircle className="h-5 w-5" />
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="admin@example.com" {...field} />
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
                                    <div className="flex items-center">
                                        <FormLabel>Password</FormLabel>
                                        <a
                                            href="#"
                                            className="ml-auto inline-block text-sm underline"
                                        >
                                            Forgot your password?
                                        </a>
                                    </div>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Signing in..." : "Sign in"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}