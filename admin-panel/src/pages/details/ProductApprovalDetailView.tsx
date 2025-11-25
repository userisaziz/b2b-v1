import { useState } from "react";
import { ArrowLeft, Package, ShoppingCart, Star, Tag, Store, Calendar, Check, X, Image } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

export default function ProductApprovalDetailView() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [adminNotes, setAdminNotes] = useState("");
    
    // Mock data for product approval request
    const approvalRequest = {
        id: 1,
        productName: "iPhone 15 Pro",
        description: "The latest iPhone with advanced camera system and powerful A17 Pro chip. Featuring a stunning titanium design and incredible performance.",
        sku: "IPH15PRO-256GB",
        price: 999.99,
        comparePrice: 1099.99,
        category: "Electronics",
        subcategory: "Smartphones",
        brand: "Apple",
        seller: "Tech Solutions Inc",
        sellerId: 1,
        stock: 25,
        weight: 0.199,
        dimensions: "146.6 × 70.6 × 8.25 mm",
        tags: ["smartphone", "apple", "ios", "5g"],
        requestDate: "2024-01-15",
        status: "pending",
        productImages: [
            {
                url: "/placeholder-product.jpg",
                alt: "iPhone 15 Pro Front View",
            },
            {
                url: "/placeholder-product-2.jpg",
                alt: "iPhone 15 Pro Back View",
            },
        ],
        sellerNotes: "This is our flagship product with high demand. We have sufficient stock to fulfill orders.",
    };

    const handleApprove = () => {
        // In a real app, this would make an API call
        console.log("Approved product request");
        navigate("/approvals/products");
    };

    const handleReject = () => {
        // In a real app, this would make an API call
        console.log("Rejected product request");
        navigate("/approvals/products");
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Product Approval Request</h1>
                    <p className="text-muted-foreground">
                        Review and decide on product listing request
                    </p>
                </div>
            </div>

            {/* Request Info */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>{approvalRequest.productName}</CardTitle>
                            <CardDescription>
                                Requested by {approvalRequest.seller} on {approvalRequest.requestDate}
                            </CardDescription>
                        </div>
                        <Badge variant="warning">Pending Review</Badge>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Product Name</h3>
                            <p className="font-medium">{approvalRequest.productName}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Description</h3>
                            <p>{approvalRequest.description}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Price</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold">${approvalRequest.price.toFixed(2)}</span>
                                {approvalRequest.comparePrice > approvalRequest.price && (
                                    <span className="text-muted-foreground line-through">${approvalRequest.comparePrice.toFixed(2)}</span>
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">SKU</h3>
                            <p className="font-mono">{approvalRequest.sku}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Category</h3>
                            <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4 text-muted-foreground" />
                                <p>{approvalRequest.category} &gt; {approvalRequest.subcategory}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Brand</h3>
                            <p>{approvalRequest.brand}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Seller</h3>
                            <div className="flex items-center gap-2">
                                <Store className="h-4 w-4 text-muted-foreground" />
                                <p>{approvalRequest.seller}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Seller Notes</h3>
                            <p>{approvalRequest.sellerNotes}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Images */}
            <Card>
                <CardHeader>
                    <CardTitle>Product Images</CardTitle>
                    <CardDescription>
                        Images provided by the seller
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {approvalRequest.productImages.map((image, index) => (
                            <div key={index} className="border rounded-lg overflow-hidden">
                                <img 
                                    src={image.url} 
                                    alt={image.alt} 
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-3">
                                    <p className="text-sm">{image.alt}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Inventory */}
            <Card>
                <CardHeader>
                    <CardTitle>Inventory Details</CardTitle>
                    <CardDescription>
                        Stock and shipping information
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <h3 className="font-medium text-sm text-muted-foreground">Stock</h3>
                        <p className="text-2xl font-bold">{approvalRequest.stock}</p>
                    </div>
                    <div>
                        <h3 className="font-medium text-sm text-muted-foreground">Weight</h3>
                        <p>{approvalRequest.weight} kg</p>
                    </div>
                    <div>
                        <h3 className="font-medium text-sm text-muted-foreground">Dimensions</h3>
                        <p>{approvalRequest.dimensions}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Tags */}
            <Card>
                <CardHeader>
                    <CardTitle>Product Tags</CardTitle>
                    <CardDescription>
                        Keywords associated with this product
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {approvalRequest.tags.map((tag, index) => (
                            <Badge key={index} variant="outline">{tag}</Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Admin Notes */}
            <Card>
                <CardHeader>
                    <CardTitle>Admin Notes</CardTitle>
                    <CardDescription>
                        Add notes for internal reference
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea
                        placeholder="Add any notes for this approval request..."
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        rows={4}
                    />
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => navigate("/approvals/products")}>
                    Cancel
                </Button>
                <Button variant="destructive" onClick={handleReject}>
                    <X className="h-4 w-4 mr-2" />
                    Reject Request
                </Button>
                <Button onClick={handleApprove}>
                    <Check className="h-4 w-4 mr-2" />
                    Approve Request
                </Button>
            </div>
        </div>
    );
}