import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { login, LoginData } from '@/src/services/auth.service';

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const credentials: LoginData = { email, password, role };
      const response = await login(credentials);
      
      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      
      // Redirect based on user role
      if (response.user.role === 'admin') {
        window.location.href = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3001/admin-dashboard/home';
      } else if (response.user.role === 'seller') {
        window.location.href = process.env.NEXT_PUBLIC_SELLER_URL || 'http://localhost:3001/seller-dashboard/home';
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Account Type</Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'buyer' | 'seller')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading}
            >
              <option value="buyer">Buyer - I want to purchase products</option>
              <option value="seller">Seller - I want to sell products</option>
            </select>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => router.push('/auth/register')}
            >
              Register here
            </button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}