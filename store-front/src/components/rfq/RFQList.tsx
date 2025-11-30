import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAllRFQs, RFQItem } from '@/src/services/rfq.service';

export default function RFQList() {
  const [rfqs, setRfqs] = useState<RFQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchRFQs = async () => {
      try {
        setLoading(true);
        const data = await getAllRFQs();
        setRfqs(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch RFQs');
      } finally {
        setLoading(false);
      }
    };

    fetchRFQs();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default">Published</Badge>;
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
      case 'expired':
        return <Badge variant="danger">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">RFQs</h1>
          <p className="text-muted-foreground">Browse and respond to requests for quotations</p>
        </div>
        <Button onClick={() => router.push('/rfqs/create')}>
          Create RFQ
        </Button>
      </div>

      {rfqs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No RFQs found</p>
            <Button className="mt-4" onClick={() => router.push('/rfqs/create')}>
              Create your first RFQ
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rfqs.map((rfq) => (
            <Card key={rfq._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{rfq.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {rfq.description.substring(0, 100)}...
                    </CardDescription>
                  </div>
                  {getStatusBadge(rfq.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity:</span>
                    <span>{rfq.quantity} {rfq.unit}</span>
                  </div>
                  {rfq.productId && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Product:</span>
                      <span>{rfq.productId.name}</span>
                    </div>
                  )}
                  {rfq.categoryId && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span>{rfq.categoryId.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Posted:</span>
                    <span>{new Date(rfq.createdAt).toLocaleDateString()}</span>
                  </div>
                  {rfq.expiryDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expires:</span>
                      <span>{new Date(rfq.expiryDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <Button 
                  className="w-full mt-4" 
                  variant="outline"
                  onClick={() => router.push(`/rfqs/${rfq._id}`)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}