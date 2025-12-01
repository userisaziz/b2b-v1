"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { 
  Plus, 
  Image as ImageIcon,
  Tag,
  Package,
  DollarSign,
  Hash,
  Folder
} from "lucide-react";

// Define the form schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  sku: z.string().min(1, "SKU is required"),
  price: z.string().min(1, "Price is required"),
  comparePrice: z.string().optional(),
  costPerItem: z.string().optional(),
  categoryIds: z.array(z.string()).min(1, "At least one category is required"),
  tags: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Mock data types
interface Category {
  id: string;
  name: string;
  level?: number;
  children?: Category[];
}

interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  price: number;
  comparePrice?: number;
  costPerItem?: number;
  status: "active" | "draft" | "archived";
  categoryIds: string[];
  tags?: string[];
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

// Mock data
const mockCategories: Category[] = [
  {
    id: "1",
    name: "Electronics",
    level: 0,
    children: [
      {
        id: "2",
        name: "Smartphones",
        level: 1,
      },
      {
        id: "5",
        name: "Laptops",
        level: 1,
      }
    ]
  },
  {
    id: "6",
    name: "Clothing",
    level: 0,
    children: [
      {
        id: "7",
        name: "Men's Clothing",
        level: 1,
      },
      {
        id: "8",
        name: "Women's Clothing",
        level: 1,
      }
    ]
  }
];

const mockProduct: Product = {
  id: "1",
  name: "iPhone 15 Pro",
  description: "The latest iPhone with advanced camera system and powerful A17 Pro chip",
  sku: "IPH15PRO-256GB",
  price: 999.99,
  comparePrice: 1099.99,
  costPerItem: 850.00,
  status: "active",
  categoryIds: ["3"],
  tags: ["smartphone", "apple", "ios", "5g"],
  images: ["/placeholder-product.jpg"],
  createdAt: "2024-01-15",
  updatedAt: "2024-01-20",
};

// Flatten categories for dropdown
const flattenCategories = (cats: Category[], level = 0): Array<Category & { level: number; displayName: string }> => {
  return cats.reduce((acc: Array<Category & { level: number; displayName: string }>, cat) => {
    const prefix = '\u00A0\u00A0'.repeat(level);
    const indicator = level > 0 ? '└─ ' : '';
    
    acc.push({
      ...cat,
      level,
      displayName: `${prefix}${indicator}${cat.name}`
    });
    
    if (cat.children && cat.children.length > 0) {
      acc.push(...flattenCategories(cat.children, level + 1));
    }
    
    return acc;
  }, []);
};

export default function EditProductPage() {
  const navigate = useNavigate();
  const params = useParams();
  const productId = params.id as string;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  
  const allCategoriesFlat = flattenCategories(mockCategories);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      price: "",
      comparePrice: "",
      costPerItem: "",
      categoryIds: [],
      tags: "",
    },
  });

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);
        // In a real app, this would fetch from an API
        setProduct(mockProduct);
        
        form.reset({
          name: mockProduct.name,
          description: mockProduct.description || "",
          sku: mockProduct.sku,
          price: mockProduct.price.toString(),
          comparePrice: mockProduct.comparePrice?.toString() || "",
          costPerItem: mockProduct.costPerItem?.toString() || "",
          categoryIds: mockProduct.categoryIds,
          tags: mockProduct.tags?.join(", ") || "",
        });
      } catch (error) {
        console.error("Error loading product:", error);
        setSubmitError("Failed to load product");
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId, form]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      // In a real app, this would make an API call
      console.log("Updating product:", data);
      
      setSubmitSuccess("Product updated successfully!");
      
      // Redirect to products page after a short delay
      setTimeout(() => {
        navigate("/products");
      }, 1500);
    } catch (error: any) {
      console.error("Error updating product:", error);
      setSubmitError(error.message || "Failed to update product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Product not found</p>
        <Button className="mt-4" onClick={() => navigate("/products")}>
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/products")}>
          <span className="sr-only">Back</span>
          ←
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground">
            Update your product details
          </p>
        </div>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Product</CardTitle>
          <CardDescription>
            Update the details for your product
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {submitSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                  {submitSuccess}
                </div>
              )}
              
              {submitError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                  {submitError}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="Enter product name"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU (Stock Keeping Unit) *</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="sku"
                      className="pl-10"
                      {...form.register("sku")}
                      placeholder="Enter SKU"
                    />
                  </div>
                  {form.formState.errors.sku && (
                    <p className="text-sm text-red-500">{form.formState.errors.sku.message}</p>
                  )}
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    placeholder="Enter product description"
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      className="pl-10"
                      {...form.register("price")}
                      placeholder="0.00"
                    />
                  </div>
                  {form.formState.errors.price && (
                    <p className="text-sm text-red-500">{form.formState.errors.price.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="comparePrice">Compare at Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="comparePrice"
                      type="number"
                      step="0.01"
                      className="pl-10"
                      {...form.register("comparePrice")}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="costPerItem">Cost per Item</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="costPerItem"
                      type="number"
                      step="0.01"
                      className="pl-10"
                      {...form.register("costPerItem")}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="categoryIds">Categories *</Label>
                  <div className="relative">
                    <Folder className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Select onValueChange={(value) => form.setValue("categoryIds", [value])}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {allCategoriesFlat.map((cat: any) => (
                          <SelectItem key={cat._id || cat.id} value={cat._id || cat.id}>
                            {cat.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {form.formState.errors.categoryIds && (
                    <p className="text-sm text-red-500">{form.formState.errors.categoryIds.message}</p>
                  )}
                  
                  {/* Display selected categories */}
                  {form.watch("categoryIds") && form.watch("categoryIds").length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.watch("categoryIds").map((categoryId) => {
                        const category = allCategoriesFlat.find(cat => cat.id === categoryId);
                        return category ? (
                          <div key={categoryId} className="flex items-center bg-secondary rounded-full px-3 py-1 text-sm">
                            <Folder className="h-3 w-3 mr-1" />
                            {category.name}
                            <button
                              type="button"
                              className="ml-2 text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                form.setValue("categoryIds", []);
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="tags"
                      className="pl-10"
                      {...form.register("tags")}
                      placeholder="Enter tags separated by commas"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Add tags to help customers find your product
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Product Images</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg overflow-hidden">
                    <img 
                      src="/placeholder-product.jpg" 
                      alt="Product" 
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-2 flex justify-between items-center">
                      <span className="text-sm">Main image</span>
                      <Button variant="ghost" size="sm">Remove</Button>
                    </div>
                  </div>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Add image
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate("/products")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Product"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}