import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Grid, ChevronRight, Folder } from 'lucide-react';
import { getAllCategories, Category, CategoryTree, searchCategories, getCategoryBreadcrumbs } from '@/src/services/category.service';

interface CategoryBrowserProps {
  onSelectCategory?: (category: Category) => void;
  showSearch?: boolean;
  showBreadcrumbs?: boolean;
}

export default function CategoryBrowser({ 
  onSelectCategory,
  showSearch = true,
  showBreadcrumbs = false
}: CategoryBrowserProps) {
  const [categoryTree, setCategoryTree] = useState<CategoryTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (categoryTree) {
      if (searchTerm.trim()) {
        // Filter categories based on search term
        const filtered = Object.values(categoryTree.categoryMap).filter(category => 
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredCategories(filtered);
      } else {
        // Show root categories when no search term
        setFilteredCategories(categoryTree.rootCategories);
      }
    }
  }, [searchTerm, categoryTree]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      setCategoryTree(data);
      setFilteredCategories(data.rootCategories);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: Category) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    } else {
      // Default navigation to category page
      router.push(`/categories/${category.slug}`);
    }
  };

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      try {
        const results = await searchCategories(term);
        setFilteredCategories(results);
      } catch (err) {
        console.error('Search error:', err);
      }
    } else if (categoryTree) {
      setFilteredCategories(categoryTree.rootCategories);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">Error loading categories</div>
        <button 
          onClick={loadCategories}
          className="text-blue-600 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showSearch && (
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
      )}

      {showBreadcrumbs && searchTerm && (
        <div className="text-sm text-gray-600">
          Search results for "{searchTerm}"
        </div>
      )}

      {filteredCategories.length === 0 ? (
        <div className="text-center py-8">
          <Grid className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {searchTerm ? 'No categories found matching your search' : 'No categories available'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <Card 
              key={category.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleCategoryClick(category)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-blue-100 rounded-md flex items-center justify-center">
                        <Folder className="h-6 w-6 text-blue-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {category.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center text-xs text-gray-500">
                        {category.childrenCount !== undefined && category.childrenCount > 0 && (
                          <span>{category.childrenCount} subcategories</span>
                        )}
                        {category.productCount !== undefined && category.productCount > 0 && (
                          <span className="ml-2">{category.productCount} products</span>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}