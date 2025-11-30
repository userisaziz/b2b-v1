import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { getCategoryBreadcrumbs, Category } from '@/src/services/category.service';

interface CategoryBreadcrumbsProps {
  category: Category;
  categoryMap: Record<string, Category>;
  className?: string;
}

export default function CategoryBreadcrumbs({ 
  category, 
  categoryMap, 
  className = '' 
}: CategoryBreadcrumbsProps) {
  const breadcrumbs = getCategoryBreadcrumbs(category, categoryMap);
  
  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav className={`flex items-center text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link href="/" className="text-blue-600 hover:underline flex items-center">
            <Home className="h-4 w-4 mr-1" />
            Home
          </Link>
        </li>
        
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <li key={breadcrumb.id} className="flex items-center">
              <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
              {isLast ? (
                <span className="text-gray-900 font-medium truncate max-w-xs">
                  {breadcrumb.name}
                </span>
              ) : (
                <Link 
                  href={`/categories/${breadcrumb.slug}`} 
                  className="text-blue-600 hover:underline truncate max-w-xs"
                >
                  {breadcrumb.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}