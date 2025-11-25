import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  ListTree, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Folder,
  ChevronRight,
  ChevronDown,
  Package,
  Eye,
  AlertCircle
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { getCategories } from "../../../services/category.service";
import { getCategoryChangeRequests, getCategoryAdditionRequests } from "../../../services/approval.service";
import type { CategoryChangeRequest, CategoryAdditionRequest } from "../../../services/approval.service";
import { useNavigate } from "react-router-dom";

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

// Union type for both request types
type AnyCategoryRequest = CategoryChangeRequest | CategoryAdditionRequest;

export default function CategoriesPage() {
  const [activeTab, setActiveTab] = useState<"categories" | "requests">("categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoriesSearchQuery, setCategoriesSearchQuery] = useState("");
  const navigate = useNavigate();
  const [categoryRequests, setCategoryRequests] = useState<AnyCategoryRequest[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategoriesFlat, setAllCategoriesFlat] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Fetch category requests from API
  useEffect(() => {
    const fetchCategoryRequests = async () => {
      try {
        setLoading(true);
        const [changeRequests, additionRequests] = await Promise.all([
          getCategoryChangeRequests(),
          getCategoryAdditionRequests()
        ]);
        
        // Combine both types of requests
        const allRequests: AnyCategoryRequest[] = [...changeRequests, ...additionRequests];
        setCategoryRequests(allRequests);
      } catch (err: any) {
        console.error("Error fetching category requests:", err);
        setError("Failed to load category requests. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryRequests();
  }, []);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const data = await getCategories();
        setCategories(data);
      } catch (err: any) {
        console.error("Error fetching categories:", err);
        setCategoriesError("Failed to load categories. Please try again later.");
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Flatten categories for search
  useEffect(() => {
    const flatten = (cats: Category[]): Category[] => {
      return cats.reduce((acc: Category[], cat) => {
        acc.push(cat);
        if (cat.children && cat.children.length > 0) {
          acc.push(...flatten(cat.children));
        }
        return acc;
      }, []);
    };
    setAllCategoriesFlat(flatten(categories));
  }, [categories]);

  const filteredRequests = categoryRequests.filter(request =>
    request.proposedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (request.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCategories = categoriesSearchQuery 
    ? allCategoriesFlat.filter(category => 
        category.name.toLowerCase().includes(categoriesSearchQuery.toLowerCase()) ||
        (category.slug && category.slug.toLowerCase().includes(categoriesSearchQuery.toLowerCase()))
      )
    : categories;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </span>
        );
    }
  };

  const getRequestType = (request: AnyCategoryRequest) => {
    return 'proposedSlug' in request ? 'Addition' : 'Change';
  };

  const getProposedName = (request: AnyCategoryRequest) => {
    return request.proposedName;
  };

  const getReason = (request: AnyCategoryRequest) => {
    return 'sellerReason' in request ? request.sellerReason : request.reason;
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const renderCategory = (category: Category, level = 0) => {
    const isExpanded = expandedCategories.has(category._id);
    const hasChildren = category.children && category.children.length > 0;
    const isSelected = selectedCategory?._id === category._id;
    
    return (
      <div key={category._id}>
        <div 
          className={`flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer transition-all duration-200 ${
            isSelected ? 'bg-accent border-primary' : 'border-border'
          }`}
          onClick={() => setSelectedCategory(category)}
        >
          <div className="flex items-center gap-3">
            <div 
              className="flex items-center justify-center w-6 h-6"
              onClick={(e) => {
                e.stopPropagation();
                if (hasChildren) toggleCategory(category._id);
              }}
            >
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )
              ) : (
                <div className="w-4 h-4" />
              )}
            </div>
            <Folder className="h-5 w-5 text-amber-500" />
            <div className="flex flex-col">
              <p className="font-medium">{category.name}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">{category.slug}</p>
                {category.level !== undefined && category.level > 0 && (
                  <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                    L{category.level}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-2">
              {category.productCount !== undefined && category.productCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-outline px-2 py-0.5 text-xs font-medium text-foreground border">
                  <Package className="h-3 w-3 mr-1" />
                  {category.productCount}
                </span>
              )}
              {(category.stats?.childrenCount !== undefined && category.stats.childrenCount > 0) && (
                <span className="inline-flex items-center rounded-full bg-outline px-2 py-0.5 text-xs font-medium text-foreground border">
                  <ListTree className="h-3 w-3 mr-1" />
                  {category.stats.childrenCount}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                // View category details if needed
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-8 mt-2 space-y-2 border-l-2 border-border pl-4">
            {category.children?.map((child: Category) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading && categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Browse product categories and request new ones
          </p>
        </div>
        <Button onClick={() => navigate("/dashboard/categories/request")}>
          <Plus className="mr-2 h-4 w-4" />
          Request Category
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("categories")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "categories"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
            }`}
          >
            All Categories
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "requests"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
            }`}
          >
            My Requests
          </button>
        </nav>
      </div>

      {activeTab === "categories" ? (
        <div className="space-y-6">
          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={categoriesSearchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCategoriesSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Categories List */}
          <Card>
            <CardHeader>
              <CardTitle>Product Categories</CardTitle>
              <CardDescription>
                Browse all available product categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : categoriesError ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <div className="text-red-500 mb-2">{categoriesError}</div>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                  </div>
                </div>
              ) : categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <ListTree className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-1">No categories found</h3>
                  <p className="text-gray-500 mb-4">
                    There are no categories available at the moment.
                  </p>
                </div>
              ) : categoriesSearchQuery ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground mb-4">Found {filteredCategories.length} categories</p>
                  {filteredCategories.map((category) => (
                    <div key={category._id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent">
                      <div className="flex items-center gap-3">
                        <Folder className="h-5 w-5 text-amber-500" />
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-sm text-muted-foreground">{category.slug}</p>
                        </div>
                        {category.productCount !== undefined && category.productCount > 0 && (
                          <span className="inline-flex items-center rounded-full bg-outline px-2 py-0.5 text-xs font-medium text-foreground border">
                            <Package className="h-3 w-3 mr-1" />
                            {category.productCount}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredCategories.map(category => renderCategory(category))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search category requests..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Category Requests Table */}
          <Card>
            <CardHeader>
              <CardTitle>My Category Requests</CardTitle>
              <CardDescription>
                View your category requests and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <div className="text-red-500 mb-2">{error}</div>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                  </div>
                </div>
              ) : categoryRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <ListTree className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-1">No category requests</h3>
                  <p className="text-gray-500 mb-4">
                    Get started by requesting a new category.
                  </p>
                  <Button onClick={() => navigate("/dashboard/categories/request")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Request Category
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request._id}>
                        <TableCell className="font-medium">{getProposedName(request)}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            {getRequestType(request)}
                          </span>
                        </TableCell>
                        <TableCell>{request.description || 'N/A'}</TableCell>
                        <TableCell>{getReason(request)}</TableCell>
                        <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}