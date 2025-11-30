import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { submitQuote, SubmitQuoteData } from '@/src/services/rfq.service';

interface QuoteFormProps {
  rfqId: string;
  onSuccess?: () => void;
}

export default function QuoteForm({ rfqId, onSuccess }: QuoteFormProps) {
  const [quotePrice, setQuotePrice] = useState(0);
  const [quoteQuantity, setQuoteQuantity] = useState(1);
  const [deliveryTime, setDeliveryTime] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const quoteData: SubmitQuoteData = {
        quotePrice,
        quoteQuantity,
        deliveryTime,
        message,
      };

      const response = await submitQuote(rfqId, quoteData);
      
      if (response) {
        setSuccess('Quote submitted successfully!');
        // Clear form
        setQuotePrice(0);
        setQuoteQuantity(1);
        setDeliveryTime('');
        setMessage('');
        
        // Call the success callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        // Optionally navigate back to RFQ list after a delay
        setTimeout(() => {
          router.push('/rfqs');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting the quote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Submit Quote</CardTitle>
        <CardDescription>
          Provide your quotation for this RFQ
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm">
              {success}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quotePrice">Quote Price ($)</Label>
              <Input
                id="quotePrice"
                type="number"
                min="0"
                step="0.01"
                value={quotePrice}
                onChange={(e) => setQuotePrice(Number(e.target.value))}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quoteQuantity">Quantity</Label>
              <Input
                id="quoteQuantity"
                type="number"
                min="1"
                value={quoteQuantity}
                onChange={(e) => setQuoteQuantity(Number(e.target.value))}
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="deliveryTime">Delivery Time</Label>
            <Input
              id="deliveryTime"
              type="text"
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
              required
              disabled={loading}
              placeholder="e.g., 3-5 business days"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
              placeholder="Any additional information or terms..."
              rows={4}
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Submitting Quote...' : 'Submit Quote'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}