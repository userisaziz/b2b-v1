import { useState } from "react";
import { ArrowLeft, Package, ShoppingCart, Star, Tag, Store, Calendar, CheckCircle, XCircle } from "lucide-react";
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

export default function ProductDetailView() {
    const navigate = useNavigate();
    const { id } = useParams();
    
    // Mock data for product details
    const product = {
        id: 1,
        name: "iPhone 15 Pro",
        description: "The latest iPhone with advanced camera system and powerful A17 Pro chip. Featuring a stunning titanium design and incredible performance.",
        sku: "IPH15PRO-256GB",
        price: 999.99,
        comparePrice: 1099.99,
        costPerItem: 850.00,
        status: "active",
        category: "Electronics",
        subcategory: "Smartphones",
        brand: "Apple",
        seller: "Tech Solutions Inc",
        sellerId: 1,
        stock: 25,
        reserved: 5,
        available: 20,
        weight: 0.199,
        dimensions: "146.6 × 70.6 × 8.25 mm",
        tags: ["smartphone", "apple", "ios", "5g"],
        createdAt: "2024-01-15",
        updatedAt: "2024-03-20",
        rating: 4.8,
        reviews: 124,
        totalSales: 45,
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return <Badge variant="success">Active</Badge>;
            case "draft":
                return <Badge variant="secondary">Draft</Badge>;
            case "archived":
                return <Badge variant="destructive">Archived</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Product Details</h1>
                    <p className="text-muted-foreground">
                        View detailed information about {product.name}
                    </p>
                </div>
            </div>

            {/* Product Info */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>{product.name}</CardTitle>
                            <CardDescription>
                                SKU: {product.sku}
                            </CardDescription>
                        </div>
                        <div className="flex gap-2">
                            {getStatusBadge(product.status)}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Description</h3>
                            <p>{product.description}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Price</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
                                {product.comparePrice > product.price && (
                                    <span className="text-muted-foreground line-through">${product.comparePrice.toFixed(2)}</span>
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Cost per item</h3>
                            <p>${product.costPerItem.toFixed(2)}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Profit</h3>
                            <p className="font-medium">${(product.price - product.costPerItem).toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Category</h3>
                            <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4 text-muted-foreground" />
                                <p>{product.category} &gt; {product.subcategory}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Brand</h3>
                            <p>{product.brand}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Seller</h3>
                            <div className="flex items-center gap-2">
                                <Store className="h-4 w-4 text-muted-foreground" />
                                <p>{product.seller}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {product.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline">{tag}</Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Inventory */}
            <Card>
                <CardHeader>
                    <CardTitle>Inventory</CardTitle>
                    <CardDescription>
                        Stock and availability information
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="border rounded-lg p-4">
                        <h3 className="font-medium text-sm text-muted-foreground">Stock</h3>
                        <p className="text-2xl font-bold">{product.stock}</p>
                    </div>
                    <div className="border rounded-lg p-4">
                        <h3 className="font-medium text-sm text-muted-foreground">Reserved</h3>
                        <p className="text-2xl font-bold">{product.reserved}</p>
                    </div>
                    <div className="border rounded-lg p-4">
                        <h3 className="font-medium text-sm text-muted-foreground">Available</h3>
                        <p className="text-2xl font-bold">{product.available}</p>
                    </div>
                    <div className="border rounded-lg p-4">
                        <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
                        <p>{product.stock > 0 ? (
                            <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                In Stock
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-red-600">
                                <XCircle className="h-4 w-4" />
                                Out of Stock
                            </span>
                        )}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Shipping */}
            <Card>
                <CardHeader>
                    <CardTitle>Shipping</CardTitle>
                    <CardDescription>
                        Physical properties and dimensions
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-medium text-sm text-muted-foreground">Weight</h3>
                        <p>{product.weight} kg</p>
                    </div>
                    <div>
                        <h3 className="font-medium text-sm text-muted-foreground">Dimensions</h3>
                        <p>{product.dimensions}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Performance */}
            <Card>
                <CardHeader>
                    <CardTitle>Performance</CardTitle>
                    <CardDescription>
                        Sales and rating metrics
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                        <h3 className="font-medium text-sm text-muted-foreground">Rating</h3>
                        <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-2xl font-bold">{product.rating}</span>
                            <span className="text-muted-foreground">({product.reviews} reviews)</span>
                        </div>
                    </div>
                    <div className="border rounded-lg p-4">
                        <h3 className="font-medium text-sm text-muted-foreground">Total Sales</h3>
                        <p className="text-2xl font-bold">{product.totalSales}</p>
                    </div>
                    <div className="border rounded-lg p-4">
                        <h3 className="font-medium text-sm text-muted-foreground">Last Updated</h3>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <p>{product.updatedAt}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}