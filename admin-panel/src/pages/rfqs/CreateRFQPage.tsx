import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Package, Tag, User, Calendar } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { createRFQ } from "@/services/rfq.service";
import { getProducts } from "@/services/product.service";
import { getCategories } from "@/services/category.service";
import { getSellers } from "@/services/seller.service";

interface Product {
  _id: string;
  name: string;
  sku: string;
}

interface Category {
  _id: string;
  name: string;
}

interface Seller {
  _id: string;
  name: string;
  companyName: string;
}

export default function CreateRFQPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSellers, setSelectedSellers] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    productId: "",
    categoryId: "",
    quantity: 1,
    unit: "pieces",
    distributionType: "all",
    expiryDate: "",
    specificationKeys: [""],
    specificationValues: [""]
  });

  // Fetch products, categories, and sellers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData, sellersData] = await Promise.all([
          getProducts(),
          getCategories(),
          getSellers()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
        setSellers(sellersData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSpecificationChange = (index: number, field: 'key' | 'value', value: string) => {
    setFormData(prev => {
      const newKeys = [...prev.specificationKeys];
      const newValues = [...prev.specificationValues];
      
      if (field === 'key') {
        newKeys[index] = value;
      } else {
        newValues[index] = value;
      }
      
      return { ...prev, specificationKeys: newKeys, specificationValues: newValues };
    });
  };

  const addSpecificationField = () => {
    setFormData(prev => ({
      ...prev,
      specificationKeys: [...prev.specificationKeys, ""],
      specificationValues: [...prev.specificationValues, ""]
    }));
  };

  const removeSpecificationField = (index: number) => {
    setFormData(prev => {
      const newKeys = [...prev.specificationKeys];
      const newValues = [...prev.specificationValues];
      
      newKeys.splice(index, 1);
      newValues.splice(index, 1);
      
      return { ...prev, specificationKeys: newKeys, specificationValues: newValues };
    });
  };

  const toggleSellerSelection = (sellerId: string) => {
    setSelectedSellers(prev => 
      prev.includes(sellerId) 
        ? prev.filter(id => id !== sellerId)
        : [...prev, sellerId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Build specifications object
      const specifications: Record<string, string> = {};
      formData.specificationKeys.forEach((key, index) => {
        if (key && formData.specificationValues[index]) {
          specifications[key] = formData.specificationValues[index];
        }
      });

      // Build RFQ data
      const rfqData = {
        title: formData.title,
        description: formData.description,
        quantity: formData.quantity,
        unit: formData.unit,
        distributionType: formData.distributionType,
        expiryDate: formData.expiryDate || undefined,
        specifications: Object.keys(specifications).length > 0 ? specifications : undefined,
        productId: formData.productId || undefined,
        categoryId: formData.categoryId || undefined,
        targetSellerIds: formData.distributionType === 'specific' ? selectedSellers : undefined
      };

      await createRFQ(rfqData);
      navigate("/rfqs");
    } catch (err: any) {
      console.error("Error creating RFQ:", err);
      setError(err.response?.data?.message || "Failed to create RFQ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create New RFQ</h1>
          <p className="text-muted-foreground mt-1">
            Create a Request for Quotation to send to sellers
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* RFQ Details */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="border-b bg-gray-50/50 px-6 py-4">
                <CardTitle>RFQ Details</CardTitle>
                <CardDescription>
                  Basic information about the request for quotation
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">RFQ Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter RFQ title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe what you're looking for..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      min="1"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit *</Label>
                    <Select name="unit" value={formData.unit} onValueChange={(value) => handleSelectChange("unit", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pieces">Pieces</SelectItem>
                        <SelectItem value="kg">Kilograms</SelectItem>
                        <SelectItem value="g">Grams</SelectItem>
                        <SelectItem value="lbs">Pounds</SelectItem>
                        <SelectItem value="m">Meters</SelectItem>
                        <SelectItem value="cm">Centimeters</SelectItem>
                        <SelectItem value="liters">Liters</SelectItem>
                        <SelectItem value="ml">Milliliters</SelectItem>
                        <SelectItem value="boxes">Boxes</SelectItem>
                        <SelectItem value="packs">Packs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="expiryDate"
                      name="expiryDate"
                      type="date"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className="pl-10"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product/Category Selection */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="border-b bg-gray-50/50 px-6 py-4">
                <CardTitle>Product/Category</CardTitle>
                <CardDescription>
                  Optional: Link this RFQ to a specific product or category
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productId">Product</Label>
                    <Select 
                      name="productId" 
                      value={formData.productId} 
                      onValueChange={(value) => handleSelectChange("productId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No specific product</SelectItem>
                        {products.map((product) => (
                          <SelectItem key={product._id} value={product._id}>
                            {product.name} (SKU: {product.sku})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Category</Label>
                    <Select 
                      name="categoryId" 
                      value={formData.categoryId} 
                      onValueChange={(value) => handleSelectChange("categoryId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No specific category</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="border-b bg-gray-50/50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Specifications</CardTitle>
                    <CardDescription>
                      Add any additional specifications for this RFQ
                    </CardDescription>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addSpecificationField}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {formData.specificationKeys.map((key, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2">
                    <div className="col-span-5">
                      <Input
                        placeholder="Specification"
                        value={key}
                        onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                      />
                    </div>
                    <div className="col-span-6">
                      <Input
                        placeholder="Value"
                        value={formData.specificationValues[index]}
                        onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                      />
                    </div>
                    <div className="col-span-1 flex items-center">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeSpecificationField(index)}
                        disabled={formData.specificationKeys.length <= 1}
                      >
                        <span className="text-red-500">×</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Distribution Settings */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="border-b bg-gray-50/50 px-6 py-4">
                <CardTitle>Distribution</CardTitle>
                <CardDescription>
                  Choose how to distribute this RFQ to sellers
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="dist-all" 
                      checked={formData.distributionType === "all"}
                      onCheckedChange={() => handleSelectChange("distributionType", "all")}
                    />
                    <Label htmlFor="dist-all">All Sellers</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="dist-category" 
                      checked={formData.distributionType === "category"}
                      onCheckedChange={() => handleSelectChange("distributionType", "category")}
                    />
                    <Label htmlFor="dist-category">Category-based</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="dist-specific" 
                      checked={formData.distributionType === "specific"}
                      onCheckedChange={() => handleSelectChange("distributionType", "specific")}
                    />
                    <Label htmlFor="dist-specific">Specific Sellers</Label>
                  </div>
                </div>

                {formData.distributionType === "specific" && (
                  <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                    <h4 className="font-medium mb-2">Select Sellers</h4>
                    <div className="space-y-2">
                      {sellers.map((seller) => (
                        <div key={seller._id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`seller-${seller._id}`}
                            checked={selectedSellers.includes(seller._id)}
                            onCheckedChange={() => toggleSellerSelection(seller._id)}
                          />
                          <Label htmlFor={`seller-${seller._id}`} className="font-normal">
                            <div className="text-sm">{seller.name}</div>
                            <div className="text-xs text-muted-foreground">{seller.companyName}</div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="shadow-sm border-gray-200">
              <CardContent className="p-6 space-y-3">
                {error && (
                  <div className="text-sm text-red-500 bg-red-50 p-2 rounded-md">
                    {error}
                  </div>
                )}
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating..." : "Create RFQ"}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}