import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; 
import { 
  ListTree, 
  Plus, 
  Edit, 
  Trash2,
  ChevronRight,
  ChevronDown,
  GripVertical,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Eye,
  Search,
  Filter,
  Folder,
  AlertCircle
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { getCategories, deleteCategory } from "@/services/category.service";

// Data types
interface Ancestor {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  _id: string;
  id: string;
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  parent_id?: string;
  level?: number;
  path?: string;
  ancestors?: Ancestor[];
  productCount?: number;
  children?: Category[];
  total_descendants?: number;
  descendant_count?: number;
  stats?: {
    childrenCount?: number;
  };
}

export default function CategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [allCategoriesFlat, setAllCategoriesFlat] = useState<Category[]>([]);
  
  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategories();
        // Convert _id to id for consistency
        const categoriesWithId = data.map((cat: any) => ({
          ...cat,
          id: cat._id,
          parent_id: cat.parentId
        }));
        setCategories(categoriesWithId);
      } catch (err) {
        setError("Failed to fetch categories");
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Flatten categories for dropdowns and search
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

  // Filter categories based on search term
  useEffect(() => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const filtered = allCategoriesFlat.filter(category => 
        category.name.toLowerCase().includes(searchLower) ||
        category.slug?.toLowerCase().includes(searchLower)
      );
      // For search results, show flat list
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchTerm, categories, allCategoriesFlat]);

  const handleEditCategory = (category: Category) => {
    // Navigate to the edit page
    navigate(`/categories/${category.id}/edit`);
  };

  const handleAddChild = (category: Category) => {
    // Navigate to the new category page with parent ID
    navigate(`/categories/new?parent_id=${category.id}`);
  };

  const handleDeleteCategory = async (category: Category) => {
    try {
      await deleteCategory(category.id);
      // Refresh categories after deletion
      const data = await getCategories();
      // Convert _id to id for consistency
      const categoriesWithId = data.map((cat: any) => ({
        ...cat,
        id: cat._id,
        parent_id: cat.parentId
      }));
      setCategories(categoriesWithId);
      setCategoryToDelete(null);
    } catch (err) {
      setError("Failed to delete category");
      console.error("Error deleting category:", err);
    }
  };

  const getCategoryStats = (category: Category) => {
    const productCount = category.productCount ?? 0;
    const childCount = category.children?.length ?? (category.stats?.childrenCount ?? 0);
    const totalDescendants = category.total_descendants ?? category.descendant_count ?? 0;
    
    return { productCount, childCount, totalDescendants };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 mb-4 text-destructive mx-auto" />
          <p className="text-lg font-medium text-destructive">Error loading categories</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories Management</h1>
          <p className="text-muted-foreground">
            Manage product categories with unlimited nesting levels
          </p>
        </div>
        <Button onClick={() => navigate("/categories/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Category Hierarchy</CardTitle>
              <CardDescription>
                Manage product categories with unlimited nesting levels. Click categories to expand/collapse.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  className="pl-8 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-muted-foreground py-12">
              <Folder className="h-16 w-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">
                {searchTerm ? 'No categories found' : 'No categories yet'}
              </p>
              <p className="text-sm">
                {searchTerm ? 'Try a different search term' : 'Create your first category to get started'}
              </p>
              {!searchTerm && (
                <Button className="mt-4" onClick={() => navigate("/categories/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              )}
            </div>
          ) : searchTerm ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-4">Found {filteredCategories.length} categories</p>
              {filteredCategories.map((category) => {
                const { productCount, childCount, totalDescendants } = getCategoryStats(category);
                return (
                  <div key={category.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent">
                    <div className="flex items-center gap-3">
                      <Folder className="h-5 w-5 text-amber-500" />
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-muted-foreground">{category.slug}</p>
                      </div>
                      {childCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {totalDescendants} descendants
                        </Badge>
                      )}
                      {productCount > 0 && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Package className="h-3 w-3" />
                          {productCount}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleAddChild(category)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Sub
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditCategory(category)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCategoryToDelete(category)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <CategoryTree
              categories={categories}
              selectedCategoryId={selectedCategory?.id}
              onSelectCategory={setSelectedCategory}
              onEdit={handleEditCategory}
              onDelete={setCategoryToDelete}
              onAddChild={handleAddChild}
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Category Confirmation Dialog */}
      <Dialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this category?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the category and all its subcategories.
              {categoryToDelete && (
                <div className="mt-2 p-2 bg-muted rounded">
                  <p className="font-medium">{categoryToDelete.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {categoryToDelete.productCount || 0} products will be affected
                  </p>
                  {categoryToDelete.children && categoryToDelete.children.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {categoryToDelete.children.length} subcategories will also be deleted
                    </p>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryToDelete(null)}>
              Cancel
            </Button>
            <Button 
              onClick={() => categoryToDelete && handleDeleteCategory(categoryToDelete)}
              variant="destructive"
            >
              Delete Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Category Tree Component
function CategoryTree({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onEdit,
  onDelete,
  onAddChild
}: {
  categories: Category[];
  selectedCategoryId?: string;
  onSelectCategory: (category: Category) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onAddChild: (category: Category) => void;
}) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

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

  const handleViewCategory = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/categories/${categoryId}`);
  };

  const renderCategory = (category: Category, level = 0) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasChildren = category.children && category.children.length > 0;
    const isSelected = selectedCategoryId === category.id;
    
    return (
      <div key={category.id}>
        <div 
          className={`flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer transition-all duration-200 ${
            isSelected ? 'bg-accent border-primary' : 'border-border'
          }`}
          onClick={() => onSelectCategory(category)}
        >
          <div className="flex items-center gap-3">
            <div 
              className="flex items-center justify-center w-6 h-6"
              onClick={(e) => {
                e.stopPropagation();
                if (hasChildren) toggleCategory(category.id);
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
                  <Badge variant="secondary" className="text-xs">
                    L{category.level}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-2">
              {category.productCount !== undefined && category.productCount > 0 && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Package className="h-3 w-3" />
                  {category.productCount}
                </Badge>
              )}
              {(category.stats?.childrenCount !== undefined && category.stats.childrenCount > 0) && (
                <Badge variant="outline" className="text-xs gap-1">
                  <ListTree className="h-3 w-3" />
                  {category.stats.childrenCount}
                </Badge>
              )}
              {/* We don't have isActive in the current interface, so we'll skip this for now */}
            </div>
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                handleViewCategory(category.id, e);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onAddChild(category);
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(category);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(category);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-8 mt-2 space-y-2 border-l-2 border-border pl-4">
            {category.children?.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {categories.map(category => renderCategory(category))}
    </div>
  );
}
