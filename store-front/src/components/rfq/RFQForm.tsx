import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createRFQ, CreateRFQData } from '@/src/services/rfq.service';

interface RFQFormProps {
  onSuccess?: () => void;
}

export default function RFQForm({ onSuccess }: RFQFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('pieces');
  const [productId, setProductId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
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
      const rfqData: CreateRFQData = {
        title,
        description,
        quantity,
        unit,
        productId: productId || undefined,
        categoryId: categoryId || undefined,
        expiryDate: expiryDate || undefined,
      };

      const response = await createRFQ(rfqData);
      
      if (response) {
        setSuccess('RFQ created successfully!');
        // Clear form
        setTitle('');
        setDescription('');
        setQuantity(1);
        setUnit('pieces');
        setProductId('');
        setCategoryId('');
        setExpiryDate('');
        
        // Call the success callback if provided
        if (onSuccess) {
          onSuccess();
        }
        
        // Optionally navigate to RFQ list page after a delay
        setTimeout(() => {
          router.push('/rfqs');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the RFQ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create RFQ</CardTitle>
        <CardDescription>
          Submit a request for quotation to get quotes from sellers
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
          
          <div className="space-y-2">
            <Label htmlFor="title">RFQ Title</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
              placeholder="e.g., Need 100 units of Product X"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={loading}
              placeholder="Describe your requirements in detail..."
              rows={4}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                required
                disabled={loading}
                placeholder="e.g., pieces, kg, liters"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productId">Product ID (Optional)</Label>
              <Input
                id="productId"
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                disabled={loading}
                placeholder="Enter product ID if applicable"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category ID (Optional)</Label>
              <Input
                id="categoryId"
                type="text"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={loading}
                placeholder="Enter category ID if applicable"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
            <Input
              id="expiryDate"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              disabled={loading}
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating RFQ...' : 'Create RFQ'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}