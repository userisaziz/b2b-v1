import { useState, useEffect } from "react";
import { ArrowLeft, ListTree, Package, Calendar, CheckCircle, XCircle, ChevronRight, Folder } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getCategory } from "@/services/category.service";

interface Ancestor {
  id: string;
  name: string;
  slug: string;
}

interface Subcategory {
  _id: string;
  id: string;
  name: string;
  slug: string;
  productCount?: number;
  isActive: boolean;
  level?: number;
}

interface Product {
  _id: string;
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: string;
}

interface CategoryData {
  _id: string;
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  level: number;
  path: string;
  ancestors?: Ancestor[];
  isActive: boolean;
  displayOrder: number;
  productCount?: number;
  childrenCount?: number;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  metadata?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  children?: Subcategory[];
}

export default function CategoryDetailView() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [category, setCategory] = useState<CategoryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchCategory = async () => {
            try {
                setLoading(true);
                // Check if ID exists and is valid
                if (!id || id === 'undefined') {
                    setError("Invalid category ID");
                    return;
                }
                
                const data = await getCategory(id);
                // Convert _id to id for consistency
                const categoryData = {
                    ...data,
                    id: data._id,
                    children: data.children?.map((child: any) => ({
                        ...child,
                        id: child._id
                    })) || []
                };
                setCategory(categoryData);
            } catch (err: any) {
                setError(err.message || "Failed to fetch category details");
                console.error("Error fetching category:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategory();
    }, [id]);
    
    const getStatusBadge = (status: boolean) => {
        return status ? (
            <Badge variant="success">Active</Badge>
        ) : (
            <Badge variant="destructive">Inactive</Badge>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading category details...</p>
                </div>
            </div>
        );
    }

    if (error || !category) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <XCircle className="h-16 w-16 mb-4 text-destructive mx-auto" />
                    <p className="text-lg font-medium text-destructive">Error loading category</p>
                    <p className="text-sm text-muted-foreground">{error || "Category not found"}</p>
                    <Button className="mt-4" onClick={() => navigate(-1)}>
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-0 h-auto"
                    onClick={() => navigate("/categories")}
                >
                    Categories
                </Button>
                <ChevronRight className="h-4 w-4" />
                {category.ancestors && category.ancestors.map((ancestor, index) => (
                    <span key={ancestor.id}>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-0 h-auto"
                            onClick={() => navigate(`/categories/${ancestor.id}`)}
                        >
                            {ancestor.name}
                        </Button>
                        <ChevronRight className="h-4 w-4" />
                    </span>
                ))}
                <span className="font-medium text-foreground">{category.name}</span>
            </div>

            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Folder className="h-8 w-8 text-amber-500" />
                        {category.name}
                    </h1>
                    <p className="text-muted-foreground">
                        View detailed information about {category.name}
                    </p>
                </div>
            </div>

            {/* Category Info */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                {category.name}
                                <Badge variant={category.isActive ? "success" : "destructive"}>
                                    {category.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </CardTitle>
                            <CardDescription>
                                Slug: {category.slug}
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Badge variant="secondary">Level {category.level}</Badge>
                            <Badge variant="outline">ID: {category.id.substring(0, 8)}...</Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground mb-1">Description</h3>
                            <p>{category.description || "No description provided"}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground mb-1">Path</h3>
                            <div className="font-mono text-sm p-2 bg-muted rounded">
                                {category.path}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground mb-1">Level</h3>
                            <p>{category.level === 0 ? "Root Category" : `Level ${category.level}`}</p>
                        </div>
                        {category.ancestors && category.ancestors.length > 0 && (
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground mb-1">Ancestors</h3>
                                <div className="flex flex-wrap gap-2">
                                    {category.ancestors.map((ancestor, index) => (
                                        <Button 
                                            key={ancestor.id} 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => navigate(`/categories/${ancestor.id}`)}
                                            className="flex items-center gap-1"
                                        >
                                            <Folder className="h-3 w-3" />
                                            {ancestor.name}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground mb-1">SEO Title</h3>
                            <p>{category.metadata?.metaTitle || "Not set"}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground mb-1">SEO Description</h3>
                            <p>{category.metadata?.metaDescription || "Not set"}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground mb-1">Keywords</h3>
                            <div className="flex flex-wrap gap-2">
                                {category.metadata?.keywords?.map((keyword, index) => (
                                    <Badge key={index} variant="outline">{keyword}</Badge>
                                )) || <span className="text-muted-foreground">No keywords</span>}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground mb-1">Display Order</h3>
                            <p>{category.displayOrder}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Package className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Products</p>
                                <p className="text-xl font-bold">{category.productCount || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <ListTree className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Subcategories</p>
                                <p className="text-xl font-bold">{category.childrenCount || category.children?.length || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Calendar className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Created</p>
                                <p className="text-xl font-bold">{new Date(category.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <Calendar className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Last Updated</p>
                                <p className="text-xl font-bold">{new Date(category.updatedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Subcategories */}
            {category.children && category.children.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ListTree className="h-5 w-5" />
                            Subcategories
                        </CardTitle>
                        <CardDescription>
                            Child categories under {category.name}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead>Level</TableHead>
                                    <TableHead>Products</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {category.children.map((subcategory) => (
                                    <TableRow key={subcategory.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Folder className="h-4 w-4 text-amber-500" />
                                                {subcategory.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>{subcategory.slug}</TableCell>
                                        <TableCell>{subcategory.level !== undefined ? `L${subcategory.level}` : "N/A"}</TableCell>
                                        <TableCell>{subcategory.productCount || 0}</TableCell>
                                        <TableCell>
                                            {getStatusBadge(subcategory.isActive)}
                                        </TableCell>
                                        <TableCell>
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => navigate(`/categories/${subcategory.id}`)}
                                            >
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Actions */}
            <div className="flex gap-2">
                <Button onClick={() => navigate(`/categories/${category.id}/edit`)}>
                    Edit Category
                </Button>
                <Button variant="outline" onClick={() => navigate(`/categories/new?parent_id=${category.id}`)}>
                    Add Subcategory
                </Button>
            </div>
        </div>
    );
}