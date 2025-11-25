import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface Category {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  parent_id?: string;
  level?: number;
  path?: string;
  ancestors?: any[];
  productCount?: number;
  children?: Category[];
  total_descendants?: number;
  descendant_count?: number;
  stats?: {
    childrenCount?: number;
  };
}

export default function CategoryForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const parentId = searchParams.get('parent_id');
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    parentId: parentId || "",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Simulate fetching category data if editing
  useEffect(() => {
    if (id) {
      setIsEditing(true);
      // Simulate API call delay
      setLoading(true);
      setTimeout(() => {
        // In a real app, this would fetch from an API
        setFormData({
          name: "Sample Category",
          slug: "sample-category",
          description: "This is a sample category description",
          parentId: parentId || "",
        });
        setLoading(false);
      }, 500);
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Auto-generate slug from name
    if (name === "name") {
      setFormData(prev => ({
        ...prev,
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (isEditing && id) {
        setSuccess("Category updated successfully");
      } else {
        setSuccess("Category created successfully");
      }
      // Redirect after 1.5 seconds
      setTimeout(() => {
        navigate("/categories");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading category...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? "Edit Category" : "Add New Category"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "Edit an existing category" : "Create a new product category"}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/categories")}>
          Back to Categories
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
          <CardDescription>
            {isEditing 
              ? "Update the details for this category" 
              : "Enter the details for your new category"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 text-green-700 rounded-lg">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter category name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="category-slug"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Used in URLs. Lowercase letters, numbers, and hyphens only.
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter category description"
                rows={4}
              />
            </div>
            
            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/categories")}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : isEditing ? "Update Category" : "Create Category"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}