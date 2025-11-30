import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import { Category } from '@/src/services/category.service';

interface CategoryTreeViewProps {
  categories: Category[];
  categoryMap: Record<string, Category>;
  onSelectCategory?: (category: Category) => void;
  expandedCategories?: string[];
  onExpandChange?: (expanded: string[]) => void;
  level?: number;
}

export default function CategoryTreeView({ 
  categories,
  categoryMap,
  onSelectCategory,
  expandedCategories = [],
  onExpandChange,
  level = 0
}: CategoryTreeViewProps) {
  const [localExpanded, setLocalExpanded] = useState<Record<string, boolean>>({});
  const router = useRouter();
  
  const isControlled = expandedCategories.length > 0 && onExpandChange !== undefined;
  const expandedState = isControlled ? expandedCategories : Object.keys(localExpanded).filter(key => localExpanded[key]);
  
  const isExpanded = (categoryId: string) => {
    return expandedState.includes(categoryId);
  };
  
  const toggleExpand = (categoryId: string) => {
    if (isControlled && onExpandChange) {
      const newExpanded = isExpanded(categoryId)
        ? expandedState.filter(id => id !== categoryId)
        : [...expandedState, categoryId];
      onExpandChange(newExpanded);
    } else {
      setLocalExpanded(prev => ({
        ...prev,
        [categoryId]: !prev[categoryId]
      }));
    }
  };
  
  const handleCategoryClick = (category: Category) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    } else {
      router.push(`/categories/${category.slug}`);
    }
  };
  
  const hasChildren = (category: Category) => {
    return category.children && category.children.length > 0;
  };

  return (
    <div className="space-y-1">
      {categories.map((category) => {
        const children = category.children || [];
        const hasChildCategories = children.length > 0;
        const expanded = isExpanded(category.id);
        
        return (
          <div key={category.id} className="select-none">
            <div 
              className={`flex items-center py-2 px-2 rounded-md hover:bg-gray-50 cursor-pointer ${
                level > 0 ? `pl-${Math.min(level * 4, 16)} border-l border-gray-200` : ''
              }`}
              onClick={() => handleCategoryClick(category)}
            >
              {hasChildCategories ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(category.id);
                  }}
                  className="mr-2 p-1 rounded hover:bg-gray-200"
                >
                  {expanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              ) : (
                <span className="mr-2 w-6"></span>
              )}
              
              {hasChildCategories && expanded ? (
                <FolderOpen className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
              ) : (
                <Folder className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
              )}
              
              <span className="flex-1 text-sm font-medium text-gray-900 truncate">
                {category.name}
              </span>
              
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                {category.productCount !== undefined && category.productCount > 0 && (
                  <span>{category.productCount}</span>
                )}
                {hasChildCategories && (
                  <span>{children.length}</span>
                )}
              </div>
            </div>
            
            {hasChildCategories && expanded && (
              <div className="ml-2">
                <CategoryTreeView
                  categories={children}
                  categoryMap={categoryMap}
                  onSelectCategory={onSelectCategory}
                  expandedCategories={expandedCategories}
                  onExpandChange={onExpandChange}
                  level={level + 1}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}