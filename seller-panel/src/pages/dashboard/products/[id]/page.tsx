import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Save,
    X,
    Upload,
    Image,
    Search,
    ChevronLeft,
    Plus,
    AlertCircle,
    Check,
    ChevronsUpDown,
    Loader2
} from "lucide-react";
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
import { getProduct, updateProduct } from "@/services/product.service";
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

export default function EditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [flatCategories, setFlatCategories] = useState<any[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    comparePrice: "",
    costPerItem: "",
    sku: "",
    barcode: "",
    quantity: "",
    moq: "1",
    weight: "",
    length: "",
    width: "",
    height: "",
    brand: "",
    categories: [] as string[],
    tags: [] as string[],
    metaTitle: "",
    metaDescription: "",
    attributes: [] as { name: string; value: string; unit?: string }[],
    status: "draft" as "draft" | "active" | "inactive"
  });

  const [currentTag, setCurrentTag] = useState("");
  const [currentAttribute, setCurrentAttribute] = useState({ name: "", value: "", unit: "" });

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

  // Load product data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        setFlatCategories(flattenCategories(categoriesData));
        
        // Fetch product data if ID exists
        if (id) {
          const productData = await getProduct(id);
          
          // Set form data with product values
          setFormData({
            name: productData.name || "",
            description: productData.description || "",
            price: productData.price?.toString() || "",
            comparePrice: productData.comparePrice?.toString() || "",
            costPerItem: productData.costPerItem?.toString() || "",
            sku: productData.sku || "",
            barcode: productData.barcode || "",
            quantity: productData.stock?.toString() || "",
            moq: productData.moq?.toString() || "1",
            weight: productData.weight?.toString() || "",
            length: productData.length?.toString() || "",
            width: productData.width?.toString() || "",
            height: productData.height?.toString() || "",
            brand: productData.brand || "",
            categories: productData.categories?.map((cat: any) => cat._id || cat.id) || [],
            tags: productData.tags || [],
            metaTitle: productData.meta?.metaTitle || "",
            metaDescription: productData.meta?.metaDescription || "",
            attributes: productData.attributes || [],
            status: productData.status || "draft"
          });
          
          // Set existing images
          if (productData.images) {
            setExistingImages(productData.images);
            setPreviewImages(productData.images);
          }
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError("Failed to load product data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategorySelectionChange = (categories: string[]) => {
    setFormData(prev => ({
      ...prev,
      categories
    }));
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleAddAttribute = () => {
    if (currentAttribute.name.trim() && currentAttribute.value.trim()) {
      setFormData(prev => ({
        ...prev,
        attributes: [...prev.attributes, { ...currentAttribute }]
      }));
      setCurrentAttribute({ name: "", value: "", unit: "" });
    }
  };

  const handleRemoveAttribute = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...files]);
      
      // Create preview URLs
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviewImages(prev => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) {
      setError("Product ID is missing");
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Prepare the payload
      const payload: any = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        comparePrice: parseFloat(formData.comparePrice) || 0,
        costPerItem: parseFloat(formData.costPerItem) || 0,
        sku: formData.sku,
        barcode: formData.barcode,
        stock: parseInt(formData.quantity) || 0,
        moq: parseInt(formData.moq) || 1,
        weight: parseFloat(formData.weight) || 0,
        length: parseFloat(formData.length) || 0,
        width: parseFloat(formData.width) || 0,
        height: parseFloat(formData.height) || 0,
        brand: formData.brand,
        categoryIds: formData.categories,
        tags: formData.tags,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        attributes: formData.attributes,
        status: "draft" // Always set to draft for approval
      };
      
      // Only include images if there are new ones
      if (imageFiles.length > 0) {
        payload.images = imageFiles;
      }
      
      await updateProduct(id, payload);
      
      setSuccess("Product updated successfully! Changes are pending admin approval.");
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate("/dashboard/products");
      }, 2000);
    } catch (err: any) {
      console.error("Error updating product:", err);
      setError(err.response?.data?.message || "Failed to update product. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/dashboard/products")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground">
            Update your product details. Changes will require admin approval.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 text-emerald-700 p-4 rounded-lg flex items-center gap-2">
          <Check className="h-5 w-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Product Information */}
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
                <CardDescription>
                  Basic information about your product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter product description"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      placeholder="Enter brand name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      placeholder="Enter SKU"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Media */}
            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
                <CardDescription>
                  Upload images for your product
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {previewImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg border overflow-hidden bg-gray-50">
                        {typeof img === 'string' ? (
                          <img 
                            src={img} 
                            alt={`Product ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  
                  <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                    <Upload className="h-6 w-6 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Add Image</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
                <CardDescription>
                  Set the pricing for your product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        className="pl-8"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="comparePrice">Compare at Price</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        id="comparePrice"
                        name="comparePrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.comparePrice}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        className="pl-8"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="costPerItem">Cost per item</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        id="costPerItem"
                        name="costPerItem"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.costPerItem}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
                <CardDescription>
                  Manage your product stock
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity <span className="text-red-500">*</span></Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="0"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      placeholder="0"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="moq">Minimum Order Quantity</Label>
                    <Input
                      id="moq"
                      name="moq"
                      type="number"
                      min="1"
                      value={formData.moq}
                      onChange={handleInputChange}
                      placeholder="1"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="barcode">Barcode (ISBN, UPC, GTIN, etc.)</Label>
                    <Input
                      id="barcode"
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleInputChange}
                      placeholder="Enter barcode"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping</CardTitle>
                <CardDescription>
                  Set product weight and dimensions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Weight</Label>
                  <div className="flex gap-2">
                    <Input
                      name="weight"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.weight}
                      onChange={handleInputChange}
                      placeholder="0.00"
                    />
                    <Select defaultValue="kg">
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="lb">lb</SelectItem>
                        <SelectItem value="oz">oz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label>Dimensions</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="space-y-2">
                      <Input
                        name="length"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.length}
                        onChange={handleInputChange}
                        placeholder="Length"
                      />
                      <span className="text-xs text-gray-500">Length</span>
                    </div>
                    <div className="space-y-2">
                      <Input
                        name="width"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.width}
                        onChange={handleInputChange}
                        placeholder="Width"
                      />
                      <span className="text-xs text-gray-500">Width</span>
                    </div>
                    <div className="space-y-2">
                      <Input
                        name="height"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.height}
                        onChange={handleInputChange}
                        placeholder="Height"
                      />
                      <span className="text-xs text-gray-500">Height</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attributes */}
            <Card>
              <CardHeader>
                <CardTitle>Attributes</CardTitle>
                <CardDescription>
                  Add custom attributes for your product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input
                    placeholder="Name"
                    value={currentAttribute.name}
                    onChange={(e) => setCurrentAttribute({...currentAttribute, name: e.target.value})}
                  />
                  <Input
                    placeholder="Value"
                    value={currentAttribute.value}
                    onChange={(e) => setCurrentAttribute({...currentAttribute, value: e.target.value})}
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Unit (optional)"
                      value={currentAttribute.unit}
                      onChange={(e) => setCurrentAttribute({...currentAttribute, unit: e.target.value})}
                    />
                    <Button type="button" onClick={handleAddAttribute} className="flex-shrink-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {formData.attributes.length > 0 && (
                  <div className="space-y-2">
                    {formData.attributes.map((attr, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium">{attr.name}:</span> {attr.value}
                          {attr.unit && <span className="text-gray-500 ml-1">({attr.unit})</span>}
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveAttribute(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
                <CardDescription>
                  Add tags to help customers find your product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter a tag"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button type="button" onClick={handleAddTag}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="gap-1.5 py-1.5 px-3">
                        <span>{tag}</span>
                        <X 
                          className="h-3.5 w-3.5 cursor-pointer hover:text-red-600 transition-colors" 
                          onClick={() => handleRemoveTag(tag)} 
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
                <CardDescription>
                  Optimize your product for search engines
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleInputChange}
                    placeholder="Enter meta title"
                    maxLength={60}
                  />
                  <p className="text-sm text-gray-500">
                    {formData.metaTitle.length}/60 characters
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleInputChange}
                    placeholder="Enter meta description"
                    rows={3}
                    maxLength={160}
                  />
                  <p className="text-sm text-gray-500">
                    {formData.metaDescription.length}/160 characters
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Organization */}
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
                <CardDescription>
                  Categorize your product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <CategoryMultiSelect
                  categories={flatCategories}
                  selectedCategories={formData.categories}
                  onSelectionChange={handleCategorySelectionChange}
                />
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
                <CardDescription>
                  Set the status of your product
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => handleSelectChange('status', value)}
                      disabled
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Changes will be submitted for admin approval.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Update Product
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate("/dashboard/products")}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}