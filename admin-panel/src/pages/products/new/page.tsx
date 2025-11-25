import { useState, useEffect, useRef } from "react";
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
import { getSellers } from "@/services/seller.service";

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
                  
                  return (
                    <button
                      key={categoryId}
                      type="button"
                      onClick={() => toggleCategory(categoryId)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-primary/5' : ''
                      }`}
                    >
                      <span className={`flex-1 text-left ${isSelected ? 'font-medium text-primary' : 'text-gray-700'}`}>
                        {cat.displayName}
                      </span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
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

export default function AddProductPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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
    status: "pending",
    seller: "",
    categories: [] as string[],
    tags: [] as string[],
    images: [] as { url: string; alt: string }[],
    metaTitle: "",
    metaDescription: "",
    attributes: [] as { name: string; value: string; unit?: string; displayType?: string }[] // Add attributes
  });
  
  const [categories, setCategories] = useState<any[]>([]);
  const [flatCategories, setFlatCategories] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentTag, setCurrentTag] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

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
        setIsLoading(true);
        
        // Fetch categories
        const categoriesData = await getCategories();
        
        // Flatten the hierarchical categories
        const flattenedCategories = flattenCategories(categoriesData);
        setFlatCategories(flattenedCategories);
        setCategories(categoriesData);
        
        // Fetch sellers
        const sellersData = await getSellers();
        setSellers(sellersData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load initial data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategorySelectionChange = (categories: string[]) => {
    setFormData(prev => ({ ...prev, categories }));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(currentTag.trim())) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, currentTag.trim()] }));
      }
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const handleAddImage = () => {
    if (imageUrlInput.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, { url: imageUrlInput.trim(), alt: formData.name }]
      }));
      setImageUrlInput("");
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
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

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.stock || !formData.seller) {
      setError("Please fill in all required fields (Name, Price, Stock, Seller)");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        moq: Number(formData.moq),
        gstPercent: Number(formData.gstPercent),
        // Ensure slug is generated if empty
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        // Format attributes for the backend
        attributes: formData.attributes.filter(attr => attr.name && attr.value)
      };

      await createProduct(payload, imageFiles);
      navigate("/products");
    } catch (err: any) {
      console.error("Error creating product:", err);
      setError(err.response?.data?.message || "Failed to create product");
    } finally {
      setIsLoading(false);
    }
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
              Create a new product listing for the marketplace
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading} className="bg-primary hover:bg-primary/90">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Product"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center gap-2" role="alert">
          <AlertCircle className="h-5 w-5" />
          <span className="block sm:inline">{error}</span>
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
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    placeholder="e.g., Sony"
                    value={formData.brand}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    placeholder="auto-generated"
                    className="bg-gray-50 font-mono text-sm"
                    value={formData.slug}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                <Textarea
                  id="description"
                  placeholder="Detailed product description..."
                  className="min-h-[150px]"
                  value={formData.description}
                  onChange={handleChange}
                />
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
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{formData.currency === 'USD' ? '$' : formData.currency === 'EUR' ? '€' : formData.currency === 'GBP' ? '£' : '₹'}</span>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0.00"
                      className="pl-7"
                      value={formData.price}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => handleSelectChange('currency', value)}>
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
                    value={formData.stock}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="moq">Minimum Order Qty</Label>
                  <Input
                    id="moq"
                    type="number"
                    value={formData.moq}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hsnCode">HSN Code</Label>
                  <Input
                    id="hsnCode"
                    placeholder="e.g., 851830"
                    value={formData.hsnCode}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstPercent">GST Rate (%)</Label>
                  <Select value={formData.gstPercent.toString()} onValueChange={(value) => handleSelectChange('gstPercent', value)}>
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
                {formData.images.map((img, index) => (
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
                <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
<div className="space-y-2">
  <Label htmlFor="seller">Seller <span className="text-red-500">*</span></Label>
  <Select value={formData.seller} onValueChange={(value) => handleSelectChange('seller', value)}>
    <SelectTrigger>
      <SelectValue placeholder="Select seller" />
    </SelectTrigger>
    <SelectContent>
      {sellers.map((seller: any) => (
        <SelectItem key={seller._id} value={seller._id}>
          {seller.shopName || seller.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

              {/* New Professional Multi-Select Component */}
              <CategoryMultiSelect
                categories={flatCategories}
                selectedCategories={formData.categories}
                onSelectionChange={handleCategorySelectionChange}
              />

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
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
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={handleAddTag}
                />
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
              {formData.attributes.map((attr, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="md:col-span-5">
                    <Label htmlFor={`attr-name-${index}`}>Attribute Name</Label>
                    <Input
                      id={`attr-name-${index}`}
                      value={attr.name}
                      onChange={(e) => {
                        const newAttributes = [...formData.attributes];
                        newAttributes[index].name = e.target.value;
                        setFormData(prev => ({ ...prev, attributes: newAttributes }));
                      }}
                      placeholder="e.g., Color, Size, Weight"
                    />
                  </div>
                  <div className="md:col-span-5">
                    <Label htmlFor={`attr-value-${index}`}>Value</Label>
                    <Input
                      id={`attr-value-${index}`}
                      value={attr.value}
                      onChange={(e) => {
                        const newAttributes = [...formData.attributes];
                        newAttributes[index].value = e.target.value;
                        setFormData(prev => ({ ...prev, attributes: newAttributes }));
                      }}
                      placeholder="e.g., Red, Large, 1.5kg"
                    />
                  </div>
                  <div className="md:col-span-2 flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const newAttributes = formData.attributes.filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, attributes: newAttributes }));
                      }}
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
                className="w-full"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    attributes: [...prev.attributes, { name: "", value: "" }]
                  }));
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Attribute
              </Button>
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
                  value={formData.metaTitle}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  placeholder="SEO Description"
                  className="min-h-[100px]"
                  value={formData.metaDescription}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}