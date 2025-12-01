"use client";

import { useState } from 'react';
import { postRFQ } from '@/lib/storefront';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomepageRFQForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: 1,
    contact_name: '',
    contact_email: '',
    contact_phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.contact_name || 
          !formData.contact_email || !formData.contact_phone) {
        throw new Error('Please fill in all required fields');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contact_email)) {
        throw new Error('Please enter a valid email address');
      }

      await postRFQ({
        title: formData.title,
        description: formData.description,
        quantity: formData.quantity,
        contact_name: formData.contact_name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        status: 'open'
      });

      setSuccess(true);
      // Reset form
      setFormData({
        title: '',
        description: '',
        quantity: 1,
        contact_name: '',
        contact_email: '',
        contact_phone: ''
      });
      
      // Hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit RFQ. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-16">
      <CardHeader>
        <CardTitle>Post a Request for Quote (RFQ)</CardTitle>
        <CardDescription>
          Tell us what you're looking for and get competitive quotes from verified suppliers
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">RFQ submitted successfully!</p>
            <p className="text-sm">Suppliers will contact you soon with their quotes.</p>
          </div>
        ) : null}

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p>{error}</p>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-gray-700">
                What are you looking for? *
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Industrial machinery, raw materials, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                Quantity Needed
              </label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Enter quantity"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">
              Detailed Description *
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your requirements, specifications, quality standards, etc."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label htmlFor="contact_name" className="text-sm font-medium text-gray-700">
                Your Name *
              </label>
              <Input
                id="contact_name"
                name="contact_name"
                value={formData.contact_name}
                onChange={handleChange}
                placeholder="Full name"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="contact_email" className="text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <Input
                id="contact_email"
                name="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="contact_phone" className="text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <Input
                id="contact_phone"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              {loading ? 'Submitting...' : 'Submit RFQ'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}