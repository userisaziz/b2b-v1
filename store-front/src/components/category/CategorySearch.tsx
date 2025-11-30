import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  X, 
  Filter,
  Folder,
  ChevronRight
} from 'lucide-react';
import { 
  getAllCategories, 
  Category, 
  CategoryTree,
  searchCategories as searchCategoriesService
} from '@/src/services/category.service';

interface CategorySearchProps {
  onCategorySelect?: (category: Category) => void;
  placeholder?: string;
  maxResults?: number;
}

export default function CategorySearch({ 
  onCategorySelect,
  placeholder = "Search categories...",
  maxResults = 10
}: CategorySearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Category[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryTree, setCategoryTree] = useState<CategoryTree | null>(null);
  const router = useRouter();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('categorySearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse recent searches', e);
      }
    }
    
    // Load category tree
    loadCategoryTree();
  }, []);

  // Save recent searches to localStorage
  useEffect(() => {
    if (recentSearches.length > 0) {
      localStorage.setItem('categorySearches', JSON.stringify(recentSearches));
    }
  }, [recentSearches]);

  const loadCategoryTree = async () => {
    try {
      const data = await getAllCategories();
      setCategoryTree(data);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    if (!categoryTree || !searchTerm) return [];
    
    const term = searchTerm.toLowerCase().trim();
    if (!term) return [];
    
    // Search in category names and descriptions
    return Object.values(categoryTree.categoryMap).filter(category => 
      category.name.toLowerCase().includes(term) ||
      (category.description && category.description.toLowerCase().includes(term)) ||
      category.slug.toLowerCase().includes(term)
    ).slice(0, maxResults);
  }, [categoryTree, searchTerm, maxResults]);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setIsOpen(true);
    
    if (value.trim()) {
      // Perform search
      performSearch(value);
    } else {
      setSearchResults([]);
    }
  };

  // Perform search using the service
  const performSearch = async (term: string) => {
    if (!term.trim()) return;
    
    try {
      setLoading(true);
      const results = await searchCategoriesService(term);
      setSearchResults(results.slice(0, maxResults));
    } catch (error) {
      console.error('Search error', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle category selection
  const handleCategorySelect = (category: Category) => {
    // Add to recent searches
    if (!recentSearches.includes(category.name)) {
      const newSearches = [category.name, ...recentSearches].slice(0, 5);
      setRecentSearches(newSearches);
    }
    
    setSearchTerm('');
    setIsOpen(false);
    
    if (onCategorySelect) {
      onCategorySelect(category);
    } else {
      // Default navigation
      router.push(`/categories/${category.slug}`);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setIsOpen(false);
  };

  // Handle recent search click
  const handleRecentSearchClick = (search: string) => {
    setSearchTerm(search);
    performSearch(search);
    setIsOpen(true);
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('categorySearches');
  };

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => searchTerm && setIsOpen(true)}
          className="pl-10 pr-10 py-2 w-full"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              Searching...
            </div>
          ) : searchTerm ? (
            <>
              {searchResults.length > 0 ? (
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Search Results
                  </div>
                  {searchResults.map((category) => (
                    <div
                      key={category.id}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                      onClick={() => handleCategorySelect(category)}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3">
                          {category.imageUrl ? (
                            <img
                              src={category.imageUrl}
                              alt={category.name}
                              className="h-8 w-8 rounded object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 bg-blue-100 rounded flex items-center justify-center">
                              <Folder className="h-4 w-4 text-blue-600" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{category.name}</div>
                          <div className="text-xs text-gray-500 flex items-center">
                            {category.path}
                            {category.productCount !== undefined && category.productCount > 0 && (
                              <span className="ml-2">
                                {category.productCount} products
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No categories found for "{searchTerm}"</p>
                </div>
              )}
            </>
          ) : (
            // Show recent searches when no search term
            recentSearches.length > 0 && (
              <div className="py-2">
                <div className="flex items-center justify-between px-4 py-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Recent Searches
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-gray-500"
                    onClick={clearRecentSearches}
                  >
                    Clear
                  </Button>
                </div>
                {recentSearches.map((search, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center"
                    onClick={() => handleRecentSearchClick(search)}
                  >
                    <Search className="h-4 w-4 text-gray-400 mr-2" />
                    <span>{search}</span>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}

      {/* Filtered Categories (Alternative Display) */}
      {searchTerm && isOpen && filteredCategories.length > 0 && (
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCategories.slice(0, 6).map((category) => (
            <Card 
              key={category.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleCategorySelect(category)}
            >
              <CardContent className="p-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-3">
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-blue-100 rounded flex items-center justify-center">
                        <Folder className="h-5 w-5 text-blue-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate text-sm">
                      {category.name}
                    </h4>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <span>{category.path}</span>
                      {category.productCount !== undefined && category.productCount > 0 && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {category.productCount}
                        </Badge>
                      )}
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