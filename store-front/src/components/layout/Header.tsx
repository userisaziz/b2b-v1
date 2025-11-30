import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getCurrentUser, logout, isAuthenticated } from '@/src/services/auth.service';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated()) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    router.push('/login');
  };

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">B2B Marketplace</h1>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <a href="/" className="transition-colors hover:text-foreground/80">
              Home
            </a>
            <a href="/rfqs" className="transition-colors hover:text-foreground/80">
              RFQs
            </a>
            <a href="/products" className="transition-colors hover:text-foreground/80">
              Products
            </a>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          {loading ? (
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          ) : user ? (
            <>
              <span className="text-sm">Welcome, {user.name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => router.push('/login')}>
                Login
              </Button>
              <Button size="sm" onClick={() => router.push('/register')}>
                Register
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}