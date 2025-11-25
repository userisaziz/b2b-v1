import { useState, useEffect } from "react";
import {
    Save,
    X,
    Upload,
    Image as ImageIcon,
    Type,
    Settings,
    Search,
    ChevronLeft,
    AlertCircle
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Autocomplete } from "@/components/ui/autocomplete";
import { createCategory, getCategories } from "@/services/category.service";

export default function AddCategoryPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const parentIdParam = searchParams.get("parent_id");

    const [isLoading, setIsLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        parentId: parentIdParam || "",
        isActive: true,
        displayOrder: 0,
        imageUrl: "",
        metaTitle: "",
        metaDescription: "",
        keywords: ""
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch (err) {
                console.error("Failed to fetch categories", err);
                setError("Failed to load categories");
            }
        };
        fetchCategories();
    }, []);

    // Auto-generate slug when name changes
    useEffect(() => {
        if (formData.name && !formData.slug) {
            const generatedSlug = formData.name
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');
            setFormData(prev => ({ ...prev, slug: generatedSlug }));
        }
    }, [formData.name, formData.slug]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleParentChange = (value: string) => {
        setFormData(prev => ({ ...prev, parentId: value }));
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, parentId: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleSave = async () => {
        if (!formData.name) {
            setError("Category name is required");
            return;
        }

        if (!formData.slug) {
            setError("Slug is required");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const payload = {
                name: formData.name,
                slug: formData.slug,
                description: formData.description,
                parentId: formData.parentId || null,
                isActive: formData.isActive,
                displayOrder: Number(formData.displayOrder),
                imageUrl: formData.imageUrl,
                metadata: {
                    metaTitle: formData.metaTitle,
                    metaDescription: formData.metaDescription,
                    keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k)
                }
            };

            await createCategory(payload);
            navigate("/categories");
        } catch (err: any) {
            console.error("Error creating category:", err);
            setError(err.response?.data?.message || err.message || "Failed to create category");
        } finally {
            setIsLoading(false);
        }
    };

    // Convert categories to autocomplete options and filter out any with empty values
    const categoryOptions = categories
        .map((cat: any) => ({
            value: cat._id || cat.id,
            label: cat.name
        }))
        .filter(option => option.value && option.value.trim() !== "");

    return (
        <div className="max-w-5xl mx-auto p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Add Category</h1>
                        <p className="text-muted-foreground mt-1">
                            Create a new product category for your store
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading} className="bg-primary hover:bg-primary/90">
                        <Save className="h-4 w-4 mr-2" />
                        {isLoading ? "Saving..." : "Save Category"}
                    </Button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center gap-2" role="alert">
                    <AlertCircle className="h-5 w-5" />
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content - Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Information */}
                    <Card className="shadow-sm border-gray-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Type className="h-5 w-5 text-primary" />
                                Basic Information
                            </CardTitle>
                            <CardDescription>
                                Enter the fundamental details of the category
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Category Name <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Electronics"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug <span className="text-red-500">*</span></Label>
                                <Input
                                    id="slug"
                                    placeholder="e.g., electronics"
                                    className="bg-gray-50 font-mono text-sm"
                                    value={formData.slug}
                                    onChange={handleChange}
                                />
                                <p className="text-xs text-muted-foreground">
                                    The "slug" is the URL-friendly version of the name. It is usually all lowercase and contains only letters, numbers, and hyphens.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe this category..."
                                    className="min-h-[120px]"
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* SEO Settings */}
                    <Card className="shadow-sm border-gray-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Search className="h-5 w-5 text-primary" />
                                SEO Settings
                            </CardTitle>
                            <CardDescription>
                                Optimize this category for search engines
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="metaTitle">Meta Title</Label>
                                <Input
                                    id="metaTitle"
                                    placeholder="SEO Title"
                                    value={formData.metaTitle}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="metaDescription">Meta Description</Label>
                                <Textarea
                                    id="metaDescription"
                                    placeholder="SEO Description"
                                    value={formData.metaDescription}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="keywords">Keywords</Label>
                                <Input
                                    id="keywords"
                                    placeholder="Comma separated keywords"
                                    value={formData.keywords}
                                    onChange={handleChange}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar - Right Column */}
                <div className="space-y-8">
                    {/* Organization */}
                    <Card className="shadow-sm border-gray-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5 text-primary" />
                                Organization
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="parentId">Parent Category</Label>
                                <Autocomplete
                                    options={categoryOptions}
                                    value={formData.parentId}
                                    onValueChange={handleParentChange}
                                    placeholder="Search for a parent category..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="displayOrder">Display Order</Label>
                                <Input
                                    id="displayOrder"
                                    type="number"
                                    name="displayOrder"
                                    value={formData.displayOrder}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Active Status</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Category will be visible to customers
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleCheckboxChange}
                                        className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Media */}
                    <Card className="shadow-sm border-gray-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ImageIcon className="h-5 w-5 text-primary" />
                                Category Image
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Upload className="h-5 w-5" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                Click to upload
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                SVG, PNG, JPG or GIF (max. 2MB)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="imageUrl">Or Image URL</Label>
                                    <Input
                                        id="imageUrl"
                                        placeholder="https://example.com/image.jpg"
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}