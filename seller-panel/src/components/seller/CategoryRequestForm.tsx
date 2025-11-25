import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, AlertTriangle, Upload, X } from "lucide-react";
import { getCategories } from "@/services/category.service";
import { createCategoryRequest } from "@/services/approval.service";

// Define Category interface based on what we expect from the API
interface Category {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  level?: number;
  path?: string;
  productCount?: number;
  children?: Category[];
  stats?: {
    childrenCount?: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  proposedName: string;
  proposedSlug: string;
  parentCategoryId: string;
  description: string;
  sellerReason: string;
}

interface CategoryRequestFormProps {
  onSubmitted?: () => void;
}

// Function to build hierarchical category options
const buildCategoryOptions = (categories: Category[]): { category: Category; level: number }[] => {
  let options: { category: Category; level: number }[] = [];
  
  // Create a map of categories by ID for quick lookup
  const categoryMap = new Map<string, Category>();
  categories.forEach(category => {
    categoryMap.set(category._id, category);
  });
  
  // Recursive function to add categories with their level
  const addCategoryWithLevel = (category: Category, level: number) => {
    options.push({ category, level });
    
    // Find all direct children of this category
    const children = categories.filter(cat => cat.parentId === category._id);
    children.forEach(child => {
      addCategoryWithLevel(child, level + 1);
    });
  };
  
  // Find root categories (those without parentId or with invalid parentId)
  const rootCategories = categories.filter(cat => !cat.parentId);
  
  // Add root categories and their descendants
  rootCategories.forEach(category => {
    addCategoryWithLevel(category, 0);
  });
  
  // Also add any orphaned categories (those with parentId that doesn't exist)
  const orphanedCategories = categories.filter(cat => 
    cat.parentId && !categoryMap.has(cat.parentId)
  );
  
  orphanedCategories.forEach(category => {
    addCategoryWithLevel(category, 0);
  });
  
  return options;
};

export default function CategoryRequestForm({ onSubmitted }: CategoryRequestFormProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const parentCategoryId = searchParams.get('parent_id');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<FormData>({
    proposedName: "",
    proposedSlug: "",
    parentCategoryId: parentCategoryId || "none",
    description: "",
    sellerReason: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch categories for parent selection
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const data = await getCategories();
        setCategories(data);
      } catch (err: any) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Auto-generate slug from name
    if (name === "proposedName") {
      setFormData(prev => ({
        ...prev,
        proposedSlug: value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        setError("Please select an image file (jpg, png, webp)");
        return;
      }
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await createCategoryRequest({
        proposedName: formData.proposedName,
        proposedSlug: formData.proposedSlug,
        parentCategoryId: formData.parentCategoryId !== "none" ? formData.parentCategoryId : undefined,
        description: formData.description,
        sellerReason: formData.sellerReason,
        image: imageFile || undefined
      });
      
      setSuccess("Category request submitted successfully");
      
      // Call the onSubmitted callback if provided
      if (onSubmitted) {
        onSubmitted();
      }
      
      // Reset form
      setFormData({
        proposedName: "",
        proposedSlug: "",
        parentCategoryId: parentCategoryId || "none",
        description: "",
        sellerReason: ""
      });
      
      // Reset image
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit category request");
    } finally {
      setLoading(false);
    }
  };

  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    );
  }

  // Build hierarchical category options
  const categoryOptions = buildCategoryOptions(categories);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Request Details</CardTitle>
        <CardDescription>
          Enter the details for your new category request at any level
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
          <div className="mb-6 p-4 bg-green-500/10 text-green-700 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span>{success}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="proposedName">Category Name *</Label>
              <Input
                id="proposedName"
                name="proposedName"
                value={formData.proposedName}
                onChange={handleChange}
                placeholder="Enter category name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="proposedSlug">Slug *</Label>
              <Input
                id="proposedSlug"
                name="proposedSlug"
                value={formData.proposedSlug}
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
            <Label htmlFor="parentCategoryId">Parent Category</Label>
            <Select 
              value={formData.parentCategoryId || "none"} 
              onValueChange={(value) => handleSelectChange("parentCategoryId", value === "none" ? "none" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a parent category (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No parent category (Root level)</SelectItem>
                {categoryOptions
                  .map(({ category, level }) => (
                    <SelectItem key={category._id} value={category._id}>
                      {/* Add indentation based on level */}
                      {'\u00A0'.repeat(level * 4)} {/* Non-breaking spaces for indentation */}
                      {category.name} {level > 0 ? `(Level ${level})` : '(Root)'}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Select a parent category to create a subcategory at any level
            </p>
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
          
          <div className="space-y-2">
            <Label htmlFor="sellerReason">Reason for Request *</Label>
            <Textarea
              id="sellerReason"
              name="sellerReason"
              value={formData.sellerReason}
              onChange={handleChange}
              placeholder="Why do you need this category?"
              rows={4}
              required
            />
            <p className="text-sm text-muted-foreground">
              Explain why this category is needed for your products
            </p>
          </div>
          
          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label>Category Image (Optional)</Label>
            <div className="flex items-start gap-4">
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              {/* Upload Area */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <Label htmlFor="image-upload">
                    <Button type="button" variant="outline" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        {imageFile ? "Change Image" : "Upload Image"}
                      </span>
                    </Button>
                  </Label>
                  {imageFile && (
                    <span className="text-sm text-muted-foreground truncate max-w-xs">
                      {imageFile.name}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Upload an image to represent this category (JPG, PNG, WebP, max 5MB)
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/dashboard/categories")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}