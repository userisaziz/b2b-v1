import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ChevronLeft,
    Edit,
    Trash2,
    Package,
    FolderTree,
    Calendar,
    CheckCircle,
    XCircle,
    ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getCategory, deleteCategory } from "@/services/category.service";
import { StatsCard } from "@/components/common/StatsCard";

export default function CategoryDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategory = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await getCategory(id);
                setCategory(data);
            } catch (err) {
                console.error("Error fetching category:", err);
                setError("Failed to load category details");
            } finally {
                setLoading(false);
            }
        };

        fetchCategory();
    }, [id]);

    const handleDelete = async () => {
        if (!id || !confirm("Are you sure you want to delete this category?")) return;
        try {
            await deleteCategory(id);
            navigate("/categories");
        } catch (err) {
            console.error("Error deleting category:", err);
            alert("Failed to delete category");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !category) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <p className="text-destructive text-lg font-medium">{error || "Category not found"}</p>
                <Button onClick={() => navigate("/categories")}>Back to Categories</Button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/categories")}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{category.name}</h1>
                        <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                            <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">{category.slug}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                {category.isActive ? (
                                    <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Active</Badge>
                                ) : (
                                    <Badge variant="secondary">Inactive</Badge>
                                )}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => navigate(`/categories/${id}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <StatsCard
                    title="Total Products"
                    value={category.stats?.productCount || 0}
                    description="Products in this category"
                    icon={Package}
                    iconColor="blue"
                />
                <StatsCard
                    title="Subcategories"
                    value={category.stats?.childrenCount || 0}
                    description="Direct children"
                    icon={FolderTree}
                    iconColor="amber"
                />
                <StatsCard
                    title="Created At"
                    value={new Date(category.createdAt).toLocaleDateString()}
                    description="Date created"
                    icon={Calendar}
                    iconColor="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 leading-relaxed">
                                {category.description || "No description provided."}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Subcategories Section */}
                    {category.children && category.children.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Subcategories</CardTitle>
                                <CardDescription>
                                    {category.children.length} subcategories under this category
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {category.children.map((subcat: any) => (
                                        <div 
                                            key={subcat._id} 
                                            className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                                            onClick={() => navigate(`/categories/${subcat._id}`)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <FolderTree className="h-5 w-5 text-amber-500" />
                                                <div>
                                                    <p className="font-medium text-gray-900">{subcat.name}</p>
                                                    <p className="text-sm text-muted-foreground">{subcat.slug}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={subcat.isActive ? "default" : "secondary"}>
                                                    {subcat.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>SEO Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Meta Title</p>
                                    <p className="text-sm">{category.metadata?.metaTitle || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Keywords</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {category.metadata?.keywords?.map((k: string, i: number) => (
                                            <Badge key={i} variant="outline" className="text-xs">{k}</Badge>
                                        )) || "-"}
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm font-medium text-muted-foreground">Meta Description</p>
                                    <p className="text-sm">{category.metadata?.metaDescription || "-"}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Details */}
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Organization</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Parent Category</p>
                                <p className="text-sm font-medium">
                                    {category.parentId ? (
                                        <Button variant="link" className="p-0 h-auto" onClick={() => navigate(`/categories/${category.parentId}`)}>
                                            View Parent
                                        </Button>
                                    ) : "Top Level"}
                                </p>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Display Order</p>
                                <p className="text-sm">{category.displayOrder}</p>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Path</p>
                                <p className="text-xs font-mono bg-gray-50 p-1 rounded mt-1">{category.path || "/"}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {category.imageUrl && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Category Image</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <img
                                    src={category.imageUrl}
                                    alt={category.name}
                                    className="w-full h-auto rounded-lg border"
                                />
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}