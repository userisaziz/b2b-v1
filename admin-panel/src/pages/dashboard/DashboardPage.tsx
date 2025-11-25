import { Users, ShoppingBag, UserCircle, TrendingUp, Folder, Package, ListTree, BarChart3 } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCategories } from "@/services/category.service";

interface Category {
  _id: string;
  id: string;
  name: string;
  slug?: string;
  productCount?: number;
  children?: Category[];
  level?: number;
  isActive?: boolean;
}

export default function DashboardPage() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                // Convert _id to id for consistency
                const categoriesWithId = data.map((cat: any) => ({
                    ...cat,
                    id: cat._id
                }));
                setCategories(categoriesWithId);
            } catch (err) {
                console.error("Error fetching categories:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);
    
    // Calculate category statistics
    const calculateCategoryStats = () => {
        let totalCategories = 0;
        let rootCategories = 0;
        let totalProducts = 0;
        
        const traverse = (cats: Category[]) => {
            cats.forEach(cat => {
                totalCategories++;
                if (cat.level === 0) rootCategories++;
                totalProducts += cat.productCount || 0;
                if (cat.children && cat.children.length > 0) {
                    traverse(cat.children);
                }
            });
        };
        
        traverse(categories);
        
        return { totalCategories, rootCategories, totalProducts };
    };
    
    const { totalCategories, rootCategories, totalProducts } = calculateCategoryStats();
    
    const stats = [
        {
            title: "Total Users",
            value: "2,543",
            description: "+12% from last month",
            icon: Users,
            trend: "up",
        },
        {
            title: "Total Sellers",
            value: "1,234",
            description: "+8% from last month",
            icon: ShoppingBag,
            trend: "up",
        },
        {
            title: "Total Buyers",
            value: "1,309",
            description: "+15% from last month",
            icon: UserCircle,
            trend: "up",
        },
        {
            title: "Active Sessions",
            value: "573",
            description: "Currently online",
            icon: TrendingUp,
            trend: "up",
        },
        {
            title: "Total Categories",
            value: totalCategories.toString(),
            description: `${rootCategories} root categories`,
            icon: Folder,
            trend: "up",
        },
        {
            title: "Total Products",
            value: totalProducts.toString(),
            description: "Across all categories",
            icon: Package,
            trend: "up",
        },
    ];

    // Get top level categories for quick view
    const topLevelCategories = categories.filter(cat => cat.level === 0).slice(0, 5);
    
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                    Welcome back! Here's an overview of your platform.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Category Hierarchy Overview */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <ListTree className="h-5 w-5" />
                                    Category Hierarchy
                                </CardTitle>
                                <CardDescription>
                                    Top level categories overview
                                </CardDescription>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate("/categories")}
                            >
                                View All
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center h-32">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {topLevelCategories.length > 0 ? (
                                    topLevelCategories.map((category) => (
                                        <div 
                                            key={category.id} 
                                            className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer"
                                            onClick={() => navigate(`/categories/${category.id}`)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Folder className="h-5 w-5 text-amber-500" />
                                                <div>
                                                    <p className="font-medium">{category.name}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-muted-foreground">
                                                            {category.slug}
                                                        </span>
                                                        {category.productCount !== undefined && category.productCount > 0 && (
                                                            <Badge variant="outline" className="text-xs">
                                                                {category.productCount} products
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                                View
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Folder className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>No categories found</p>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="mt-2"
                                            onClick={() => navigate("/categories/new")}
                                        >
                                            Create Category
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Recent Activity
                        </CardTitle>
                        <CardDescription>
                            Latest user registrations and activities
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                {
                                    user: "John Doe",
                                    action: "registered as a seller",
                                    time: "2 minutes ago",
                                },
                                {
                                    user: "Jane Smith",
                                    action: "registered as a buyer",
                                    time: "15 minutes ago",
                                },
                                {
                                    user: "Mike Johnson",
                                    action: "updated profile",
                                    time: "1 hour ago",
                                },
                                {
                                    user: "Sarah Williams",
                                    action: "registered as a seller",
                                    time: "2 hours ago",
                                },
                                {
                                    user: "Alex Chen",
                                    action: "added new product",
                                    time: "3 hours ago",
                                },
                            ].map((activity, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                                >
                                    <div>
                                        <p className="text-sm font-medium">{activity.user}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {activity.action}
                                        </p>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {activity.time}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}