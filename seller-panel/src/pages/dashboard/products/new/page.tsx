import { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
    Save,
    X,
    Upload,
    Image,
    Package,
    DollarSign,
    Layers,
    Search,
    ChevronLeft,
    Plus,
    AlertCircle,
    Check,
    ChevronsUpDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { createProduct } from "@/services/product.service";
import { getCategories } from "@/services/category.service";

// Professional Multi-Select Component
function CategoryMultiSelect({ 
  categories, 
  selectedCategories, 
  onSelectionChange 
}: {
  categories: any[];
  selectedCategories: string[];
  onSelectionChange: (categories: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter categories based on search
  const filteredCategories = categories.filter(cat =>
    cat.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onSelectionChange(selectedCategories.filter(id => id !== categoryId));
    } else {
      onSelectionChange([...selectedCategories, categoryId]);
    }
  };

  const removeCategory = (categoryId: string) => {
    onSelectionChange(selectedCategories.filter(id => id !== categoryId));
  };

  return (
    <div className="space-y-2">
      <Label>Categories</Label>
      
      {/* Selected Categories Display */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          {selectedCategories.map(catId => {
            const cat = categories.find(c => (c._id || c.id) === catId);
            return cat ? (
              <Badge 
                key={catId} 
                variant="secondary" 
                className="gap-1.5 py-1.5 px-3 bg-white border border-gray-300 hover:border-gray-400 transition-colors"
              >
                <span className="text-sm font-medium">{cat.displayName}</span>
                <X 
                  className="h-3.5 w-3.5 cursor-pointer hover:text-red-600 transition-colors" 
                  onClick={() => removeCategory(catId)} 
                />
              </Badge>
            ) : null;
          })}
        </div>
      )}

      {/* Dropdown Trigger */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
          className="w-full flex items-center justify-between px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        >
          <span className="text-gray-700">
            {selectedCategories.length === 0 
              ? "Select categories..." 
              : `${selectedCategories.length} selected`}
          </span>
          <ChevronsUpDown className="h-4 w-4 text-gray-400" />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 border-gray-300 focus:border-primary"
                />
              </div>
            </div>

            {/* Category List */}
            <div className="overflow-y-auto max-h-64">
              {filteredCategories.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  No categories found
                </div>
              ) : (
                filteredCategories.map((cat) => {
                  const categoryId = cat._id || cat.id;
                  const isSelected = selectedCategories.includes(categoryId);
                  
                  // Calculate depth based on ">" separators in displayName
                  const depth = (cat.displayName.match(/>/g) || []).length;
                  const paddingLeft = 16 + (depth * 20); // Base 16px + 20px per level
                  
                  return (
                    <button
                      key={categoryId}
                      type="button"
                      onClick={() => toggleCategory(categoryId)}
                      className={`w-full flex items-center justify-between py-2.5 pr-4 text-sm hover:bg-gray-50 transition-colors border-l-2 ${
                        isSelected ? 'bg-primary/5 border-l-primary' : 'border-l-transparent'
                      }`}
                      style={{ paddingLeft: `${paddingLeft}px` }}
                    >
                      <span className={`flex-1 text-left ${isSelected ? 'font-medium text-primary' : 'text-gray-700'}`}>
                        {/* Show only the last part of the category name */}
                        {cat.displayName.split(' > ').pop()}
                      </span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary flex-shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {selectedCategories.length > 0 && (
              <div className="p-2 border-t border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={() => onSelectionChange([])}
                  className="w-full text-sm text-gray-600 hover:text-gray-900 py-1.5 font-medium"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Validation schema
const productValidationSchema = Yup.object({
  name: Yup.string().required("Product name is required"),
  description: Yup.string().required("Description is required"),
  price: Yup.number().required("Price is required").positive("Price must be positive"),
  stock: Yup.number().required("Stock is required").min(0, "Stock cannot be negative"),
  brand: Yup.string().optional(),
  sku: Yup.string().required("SKU is required"),
  slug: Yup.string().required("Slug is required"),
  moq: Yup.number().optional().min(1, "MOQ must be at least 1"),
  hsnCode: Yup.string().optional(),
  gstPercent: Yup.number().optional(),
  categories: Yup.array().of(Yup.string()).min(1, "At least one category is required"),
  tags: Yup.array().of(Yup.string()).optional(),
  attributes: Yup.array().of(Yup.object({
    name: Yup.string().required("Attribute name is required"),
    value: Yup.string().required("Attribute value is required"),
    unit: Yup.string().optional()
  })).optional()
});

export default function AddProductPage() {
  const navigate = useNavigate();
  const [flatCategories, setFlatCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");

  // Function to flatten hierarchical categories and create full paths
  const flattenCategories = (categories: any[], prefix = ''): any[] => {
    let flattened: any[] = [];
    
    categories.forEach(category => {
      // Create the display name with full path
      const displayName = prefix ? `${prefix} > ${category.name}` : category.name;
      
      // Add the category to the flattened list
      flattened.push({
        ...category,
        displayName
      });
      
      // Recursively flatten children if they exist
      if (category.children && category.children.length > 0) {
        flattened = flattened.concat(flattenCategories(category.children, displayName));
      }
    });
    
    return flattened;
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch categories
        const categoriesData = await getCategories();
        
        // Flatten the hierarchical categories
        const flattenedCategories = flattenCategories(categoriesData);
        setFlatCategories(flattenedCategories);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchInitialData();
  }, []);

  const formik = useFormik({
    initialValues: {
      name: "",
      slug: "",
      description: "",
      brand: "",
      price: "",
      currency: "INR",
      stock: "",
      moq: 1,
      hsnCode: "",
      gstPercent: "18",
      status: "draft",
      categories: [] as string[],
      tags: [] as string[],
      images: [] as { url: string; alt: string }[],
      metaTitle: "",
      metaDescription: "",
      sku: "",
      attributes: [] as { name: string; value: string; unit?: string }[]
    },
    validationSchema: productValidationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const payload = {
          ...values,
          price: Number(values.price),
          stock: Number(values.stock),
          moq: Number(values.moq),
          gstPercent: Number(values.gstPercent),
          // Generate slug if empty
          slug: values.slug || values.name.toLowerCase().replace(/\s+/g, '-'),
          // Generate SKU if not provided
          sku: values.sku || values.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          // Set status to draft for seller workflow
          status: "draft",
          // Convert categories to the expected format
          categoryIds: values.categories,
          // Format attributes for the backend
          attributes: values.attributes.map(attr => ({
            name: attr.name,
            value: attr.value,
            unit: attr.unit || undefined,
            displayType: 'text',
            isSearchable: true,
            isFilterable: true
          })).filter(attr => attr.name && attr.value)
        };

        // Log the payload to see what's being sent
        console.log("Sending product payload:", payload);
        console.log("Status value being sent:", payload.status);

        await createProduct(payload, imageFiles);
        navigate("/dashboard/products");
      } catch (err: any) {
        console.error("Error creating product:", err);
        // Set a general error message
        formik.setFieldError('name', err.response?.data?.message || "Failed to create product. Please check the form and try again.");
      } finally {
        setIsLoading(false);
      }
    }
  });

  // Auto-generate slug when name changes
  useEffect(() => {
    if (formik.values.name && !formik.values.slug) {
      const generatedSlug = formik.values.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      formik.setFieldValue('slug', generatedSlug);
    }
  }, [formik.values.name, formik.values.slug]);

  // Auto-generate SKU when name changes
  useEffect(() => {
    if (formik.values.name && !formik.values.sku) {
      const generatedSKU = formik.values.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      formik.setFieldValue('sku', generatedSKU);
    }
  }, [formik.values.name, formik.values.sku]);

  const handleCategorySelectionChange = (categories: string[]) => {
    formik.setFieldValue('categories', categories);
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && formik.values.tags.join('').trim()) {
      e.preventDefault();
      const newTag = formik.values.tags.join('').trim();
      if (!formik.values.tags.includes(newTag)) {
        formik.setFieldValue('tags', [...formik.values.tags, newTag]);
      }
      formik.setFieldValue('tags', []);
    }
  };

  const removeTag = (tagToRemove: string) => {
    formik.setFieldValue('tags', formik.values.tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddImage = () => {
    if (imageUrlInput.trim()) {
      formik.setFieldValue('images', [
        ...formik.values.images,
        { url: imageUrlInput.trim(), alt: formik.values.name }
      ]);
      setImageUrlInput("");
    }
  };

  const removeImage = (index: number) => {
    formik.setFieldValue('images', formik.values.images.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...files]);
      
      // Create preview URLs
      const previews = files.map(file => URL.createObjectURL(file));
      setPreviewImages(prev => [...prev, ...previews]);
    }
  };

  const removeImageFile = (index: number) => {
    // Remove the file
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    
    // Revoke the preview URL and remove it
    const newPreviews = [...previewImages];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPreviewImages(newPreviews);
  };

  const addAttribute = () => {
    formik.setFieldValue('attributes', [
      ...formik.values.attributes,
      { name: "", value: "", unit: "" }
    ]);
  };

  const removeAttribute = (index: number) => {
    const newAttributes = formik.values.attributes.filter((_, i) => i !== index);
    formik.setFieldValue('attributes', newAttributes);
  };

  const updateAttribute = (index: number, field: string, value: string) => {
    const newAttributes = [...formik.values.attributes];
    (newAttributes[index] as any)[field] = value;
    formik.setFieldValue('attributes', newAttributes);
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Add Product</h1>
            <p className="text-muted-foreground mt-1">
              Create a new product for your store
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button 
            onClick={() => formik.handleSubmit()} 
            disabled={isLoading || !formik.isValid || !formik.dirty}
            className="bg-primary hover:bg-primary/90"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Product"}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {formik.submitCount > 0 && Object.keys(formik.errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center gap-2" role="alert">
          <AlertCircle className="h-5 w-5" />
          <div>
            <span className="block sm:inline">Please fix the errors in the form</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Details */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Basic Details
              </CardTitle>
              <CardDescription>
                Product name, description, and identification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  placeholder="e.g., Wireless Noise Cancelling Headphones"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="text-sm text-red-600">{formik.errors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    placeholder="e.g., Sony"
                    value={formik.values.brand}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU <span className="text-red-500">*</span></Label>
                  <Input
                    id="sku"
                    placeholder="e.g., wireless-headphones-001"
                    value={formik.values.sku}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.sku && formik.errors.sku && (
                    <p className="text-sm text-red-600">{formik.errors.sku}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">Slug <span className="text-red-500">*</span></Label>
                <Input
                  id="slug"
                  placeholder="auto-generated"
                  className="bg-gray-50 font-mono text-sm"
                  value={formik.values.slug}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.slug && formik.errors.slug && (
                  <p className="text-sm text-red-600">{formik.errors.slug}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                <Textarea
                  id="description"
                  placeholder="Detailed product description..."
                  className="min-h-[150px]"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.description && formik.errors.description && (
                  <p className="text-sm text-red-600">{formik.errors.description}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Inventory */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Pricing & Inventory
              </CardTitle>
              <CardDescription>
                Set prices, stock levels, and tax information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Price <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{formik.values.currency === 'USD' ? '$' : formik.values.currency === 'EUR' ? '€' : formik.values.currency === 'GBP' ? '£' : '₹'}</span>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0.00"
                      className="pl-7"
                      value={formik.values.price}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>
                  {formik.touched.price && formik.errors.price && (
                    <p className="text-sm text-red-600">{formik.errors.price}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={formik.values.currency} 
                    onValueChange={(value) => formik.setFieldValue('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity <span className="text-red-500">*</span></Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="0"
                    value={formik.values.stock}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.stock && formik.errors.stock && (
                    <p className="text-sm text-red-600">{formik.errors.stock}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="moq">Minimum Order Qty</Label>
                  <Input
                    id="moq"
                    type="number"
                    value={formik.values.moq}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hsnCode">HSN Code</Label>
                  <Input
                    id="hsnCode"
                    placeholder="e.g., 851830"
                    value={formik.values.hsnCode}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstPercent">GST Rate (%)</Label>
                  <Select 
                    value={formik.values.gstPercent.toString()} 
                    onValueChange={(value) => formik.setFieldValue('gstPercent', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select GST rate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0%</SelectItem>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="12">12%</SelectItem>
                      <SelectItem value="18">18%</SelectItem>
                      <SelectItem value="28">28%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media Gallery */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5 text-primary" />
                Product Images
              </CardTitle>
              <CardDescription>
                Add image URLs for the product gallery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {/* Preview uploaded files */}
                {previewImages.map((preview, index) => (
                  <div key={`preview-${index}`} className="aspect-square rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center relative group overflow-hidden">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => removeImageFile(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {/* Preview existing image URLs */}
                {formik.values.images.map((img, index) => (
                  <div key={`url-${index}`} className="aspect-square rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center relative group overflow-hidden">
                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => removeImage(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {/* Upload area */}
                <div className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-4">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    id="image-upload"
                    onChange={handleFileChange}
                  />
                  <Label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Upload Images</span>
                  </Label>
                </div>
              </div>
              
              {/* URL input for existing images (optional) */}
              <div className="mt-4">
                <Label>Or add image URLs</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Image URL"
                    className="flex-1 h-8 text-xs"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddImage()}
                  />
                  <Button size="sm" variant="secondary" onClick={handleAddImage} type="button">
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attributes Section */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Product Attributes
              </CardTitle>
              <CardDescription>
                Add key product specifications and features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Attributes List */}
              {formik.values.attributes.map((attr, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="md:col-span-4">
                    <Label htmlFor={`attr-name-${index}`}>Name</Label>
                    <Input
                      id={`attr-name-${index}`}
                      value={attr.name}
                      onChange={(e) => updateAttribute(index, 'name', e.target.value)}
                      placeholder="e.g., Weight"
                    />
                    {formik.errors.attributes && (formik.errors.attributes as any)[index]?.name && (
                      <p className="text-sm text-red-600">{(formik.errors.attributes as any)[index]?.name}</p>
                    )}
                  </div>
                  <div className="md:col-span-4">
                    <Label htmlFor={`attr-value-${index}`}>Value</Label>
                    <Input
                      id={`attr-value-${index}`}
                      value={attr.value}
                      onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                      placeholder="e.g., 1.5"
                    />
                    {formik.errors.attributes && (formik.errors.attributes as any)[index]?.value && (
                      <p className="text-sm text-red-600">{(formik.errors.attributes as any)[index]?.value}</p>
                    )}
                  </div>
                  <div className="md:col-span-3">
                    <Label htmlFor={`attr-unit-${index}`}>Unit (optional)</Label>
                    <Input
                      id={`attr-unit-${index}`}
                      value={attr.unit || ""}
                      onChange={(e) => updateAttribute(index, 'unit', e.target.value)}
                      placeholder="e.g., kg"
                    />
                  </div>
                  <div className="md:col-span-1 flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeAttribute(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Add Attribute Button */}
              <Button
                type="button"
                variant="outline"
                onClick={addAttribute}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Attribute
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-8">
          {/* Organization */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Organization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formik.values.status} 
                  onValueChange={(value) => formik.setFieldValue('status', value)}
                  disabled
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Products are saved as drafts and require admin approval
                </p>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <Label>Categories <span className="text-red-500">*</span></Label>
                <CategoryMultiSelect
                  categories={flatCategories}
                  selectedCategories={formik.values.categories}
                  onSelectionChange={handleCategorySelectionChange}
                />
                {formik.touched.categories && formik.errors.categories && (
                  <p className="text-sm text-red-600">{formik.errors.categories}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formik.values.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-500"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Type and press Enter..."
                  value={formik.values.tags.join('')}
                  onChange={(e) => formik.setFieldValue('tags', [e.target.value])}
                  onKeyDown={handleAddTag}
                />
              </div>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                SEO Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  placeholder="SEO Title"
                  value={formik.values.metaTitle}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  placeholder="SEO Description"
                  className="min-h-[100px]"
                  value={formik.values.metaDescription}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}