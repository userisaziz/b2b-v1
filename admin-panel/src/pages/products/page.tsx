import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import {
  Search,
  MoreVertical,
  Plus,
  Package,
  AlertTriangle,
  Archive,
  Eye,
  Pencil,
  Trash2,
  Filter,
  Grid,
  List,
  Upload,
  Download,
  BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatsCard } from "@/components/common/StatsCard";
import { getProducts } from "@/services/product.service";

// Types for product data
interface ProductCategory {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  status: string;
  sku: string;
  categories: ProductCategory[];
  brand?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("name");
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter and sort products
  useEffect(() => {
    let result = [...products];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        (product.brand && product.brand.toLowerCase().includes(query))
      );
    }
    
    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter(product => 
        product.categories.some(cat => cat.name === categoryFilter)
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(product => product.status === statusFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "stock-low":
          return a.stock - b.stock;
        case "stock-high":
          return b.stock - a.stock;
        case "date-new":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "date-old":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
          return 0;
      }
    });
    
    setFilteredProducts(result);
  }, [products, searchQuery, categoryFilter, statusFilter, sortBy]);

  // Get unique categories
  const getCategories = () => {
    const allCategories = products.flatMap(product => 
      product.categories.map(cat => cat.name)
    );
    return ["all", ...Array.from(new Set(allCategories))];
  };

  const categories = getCategories();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-200">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-amber-200">Inactive</Badge>;
      case "draft":
        return <Badge variant="outline" className="bg-gray-500/15 text-gray-700 hover:bg-gray-500/25 border-gray-200">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryNames = (categories: ProductCategory[]) => {
    if (!Array.isArray(categories) || categories.length === 0) return "Uncategorized";
    return categories.map(cat => cat.name).join(", ");
  };

  const handleDeleteProduct = (productId: string) => {
    // In a real app, this would make an API call
    console.log("Deleting product", productId);
    setDropdownOpen(null);
  };

  const handleCategoryFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
  };

  const handleStatusFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleSortByChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setStatusFilter("all");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Error loading products</h3>
          <p className="text-muted-foreground mt-1">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product inventory and listings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => navigate("/products/new")} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Products"
          value={products.length}
          description={`${products.filter(p => p.status === 'active').length} active`}
          icon={Package}
          iconColor="blue"
        />
        <StatsCard
          title="Low Stock"
          value={products.filter(p => p.stock > 0 && p.stock <= 10).length}
          description="Less than 10 items"
          icon={AlertTriangle}
          iconColor="amber"
        />
        <StatsCard
          title="Out of Stock"
          value={products.filter(p => p.stock === 0).length}
          description="Restock needed"
          icon={Archive}
          iconColor="red"
        />
        <StatsCard
          title="Draft Products"
          value={products.filter(p => p.status === 'draft').length}
          description="Not published"
          icon={Upload}
          iconColor="purple"
        />
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={categoryFilter}
                  onChange={handleCategoryFilterChange}
                  className="border rounded-md px-3 py-2 text-sm"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </option>
                  ))}
                </select>
                
                <select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="border rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={handleSortByChange}
                  className="border rounded-md px-3 py-2 text-sm"
                >
                  <option value="name">Sort by: Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="stock-low">Stock: Low to High</option>
                  <option value="stock-high">Stock: High to Low</option>
                  <option value="date-new">Newest First</option>
                  <option value="date-old">Oldest First</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-gray-100" : ""}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-gray-100" : ""}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {(searchQuery || categoryFilter !== "all" || statusFilter !== "all") && (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredProducts.length} of {products.length} products
              </p>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Grid/List View */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No products found</h3>
            <p className="text-muted-foreground mt-1">
              Try adjusting your search terms or filters
            </p>
            <Button className="mt-4" onClick={clearFilters}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        // Grid View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product._id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{product.sku}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger onClick={() => setDropdownOpen(dropdownOpen === product._id ? null : product._id)}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent open={dropdownOpen === product._id} align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => {
                        setDropdownOpen(null);
                        navigate(`/products/${product._id}`);
                      }}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setDropdownOpen(null);
                        navigate(`/products/${product._id}/edit`);
                      }}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Product
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDeleteProduct(product._id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="mt-4 flex items-center justify-center bg-gray-50 rounded-lg h-32">
                  <Package className="h-12 w-12 text-gray-300" />
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Price</span>
                    <span className="font-medium">${product.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Stock</span>
                    <span className="font-medium">{product.stock} items</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <Badge variant="outline" className="text-xs">
                      {getCategoryNames(product.categories).substring(0, 15) + (getCategoryNames(product.categories).length > 15 ? "..." : "")}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status</span>
                    {getStatusBadge(product.status)}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        // List View
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product._id}>
                  <TableCell className="pl-6 font-medium">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-400">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {product.brand || "No brand"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getCategoryNames(product.categories).substring(0, 20) + (getCategoryNames(product.categories).length > 20 ? "..." : "")}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    ${product.price.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {product.stock}
                      {product.stock === 0 && (
                        <Badge variant="destructive" className="ml-1">Out</Badge>
                      )}
                      {product.stock > 0 && product.stock <= 10 && (
                        <Badge variant="secondary" className="ml-1">Low</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{product.sku}</TableCell>
                  <TableCell>{getStatusBadge(product.status)}</TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger onClick={() => setDropdownOpen(dropdownOpen === product._id ? null : product._id)}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent open={dropdownOpen === product._id} align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => {
                          setDropdownOpen(null);
                          navigate(`/products/${product._id}`);
                        }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setDropdownOpen(null);
                          navigate(`/products/${product._id}/edit`);
                        }}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit Product
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}