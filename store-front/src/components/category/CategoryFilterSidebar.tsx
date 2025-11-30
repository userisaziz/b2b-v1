import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  X, 
  Filter,
  ChevronDown,
  ChevronRight,
  Folder
} from 'lucide-react';
import { 
  getAllCategories, 
  Category, 
  CategoryTree
} from '@/src/services/category.service';
import CategoryTreeView from './CategoryTreeView';

interface CategoryFilterSidebarProps {
  onCategorySelect?: (category: Category) => void;
  selectedCategory?: string;
  onFilterChange?: (filters: any) => void;
}

export default function CategoryFilterSidebar({ 
  onCategorySelect,
  selectedCategory,
  onFilterChange
}: CategoryFilterSidebarProps) {
  const [categoryTree, setCategoryTree] = useState<CategoryTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      setCategoryTree(data);
      
      // Expand root categories by default
      const rootCategoryIds = data.rootCategories.map(cat => cat.id);
      setExpandedCategories(rootCategoryIds);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    
    // Expand all categories when searching
    if (term.trim() && categoryTree) {
      const allCategoryIds = Object.keys(categoryTree.categoryMap);
      setExpandedCategories(allCategoryIds);
    } else if (categoryTree) {
      // Reset to root categories when search is cleared
      const rootCategoryIds = categoryTree.rootCategories.map(cat => cat.id);
      setExpandedCategories(rootCategoryIds);
    }
  };

  const filteredCategories = (): Category[] => {
    if (!categoryTree) return [];
    
    if (!searchTerm.trim()) {
      return categoryTree.rootCategories;
    }
    
    const term = searchTerm.toLowerCase();
    return Object.values(categoryTree.categoryMap).filter(category => 
      category.name.toLowerCase().includes(term) ||
      (category.description && category.description.toLowerCase().includes(term))
    );
  };

  const handleExpandChange = (expanded: string[]) => {
    setExpandedCategories(expanded);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 text-sm">{error}</div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={loadCategories}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Categories
          </div>
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => handleSearch('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full"
          />
        </div>

        {/* Category Tree */}
        {categoryTree && (
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
            {filteredCategories().length > 0 ? (
              <CategoryTreeView
                categories={filteredCategories()}
                categoryMap={categoryTree.categoryMap}
                onSelectCategory={onCategorySelect}
                expandedCategories={expandedCategories}
                onExpandChange={handleExpandChange}
              />
            ) : (
              <div className="text-center py-4">
                <Folder className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No categories found</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}