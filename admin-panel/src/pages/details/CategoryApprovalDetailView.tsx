import { useState, useEffect } from "react";
import { ArrowLeft, FolderTree, Store, Calendar, Check, X, FileText, Hash, AlignLeft } from "lucide-react";
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
import { 
    getCategoryRequest, 
    approveCategoryRequest, 
    rejectCategoryRequest 
} from "@/services/approval.service";
import type { CategoryRequest } from "@/services/approval.service";

export default function CategoryApprovalDetailView() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [request, setRequest] = useState<CategoryRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [adminNotes, setAdminNotes] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    
    // Fetch category request details
    useEffect(() => {
        const fetchRequest = async () => {
            try {
                setLoading(true);
                const data = await getCategoryRequest(id!);
                setRequest(data);
            } catch (err) {
                console.error("Error fetching category request:", err);
                setError("Failed to load category request details");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchRequest();
        }
    }, [id]);

    const handleApprove = async () => {
        try {
            await approveCategoryRequest(id!);
            navigate("/approvals/categories");
        } catch (err) {
            console.error("Error approving category request:", err);
            alert("Failed to approve category request");
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            alert("Please provide a rejection reason");
            return;
        }
        
        try {
            await rejectCategoryRequest(id!, rejectionReason);
            navigate("/approvals/categories");
        } catch (err) {
            console.error("Error rejecting category request:", err);
            alert("Failed to reject category request");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !request) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <X className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Error loading request</h3>
                    <p className="text-muted-foreground mt-1">{error || "Category request not found"}</p>
                    <Button className="mt-4" onClick={() => navigate("/approvals/categories")}>
                        Back to Requests
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Category Approval Request</h1>
                    <p className="text-muted-foreground">
                        Review and decide on category addition request
                    </p>
                </div>
            </div>

            {/* Request Info */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>{request.proposedName}</CardTitle>
                            <CardDescription>
                                Requested by {request.sellerId.name} on {new Date(request.createdAt).toLocaleDateString()}
                            </CardDescription>
                        </div>
                        <Badge variant={request.status === "pending" ? "warning" : request.status === "approved" ? "default" : "destructive"}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                                <FolderTree className="h-4 w-4" />
                                Category Name
                            </h3>
                            <p className="font-medium">{request.proposedName}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                                <Hash className="h-4 w-4" />
                                Category Slug
                            </h3>
                            <p className="font-mono">{request.proposedSlug}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                                <AlignLeft className="h-4 w-4" />
                                Description
                            </h3>
                            <p>{request.description || "No description provided"}</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                                <Store className="h-4 w-4" />
                                Seller
                            </h3>
                            <p>{request.sellerId.name}</p>
                            <p className="text-sm text-muted-foreground">{request.sellerId.companyName}</p>
                            <p className="text-sm text-muted-foreground">{request.sellerId.email}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Parent Category</h3>
                            <p>{request.parentCategoryName || "Root Category"}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Seller Reason
                            </h3>
                            <p>{request.sellerReason}</p>
                        </div>
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

            {/* Rejection Reason (only shown when rejecting) */}
            {request.status === "pending" && (
                <Card>
                    <CardHeader>
                        <CardTitle>Rejection Reason</CardTitle>
                        <CardDescription>
                            Provide a reason for rejecting this request
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="Enter rejection reason..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={4}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => navigate("/approvals/categories")}>
                    Cancel
                </Button>
                {request.status === "pending" && (
                    <>
                        <Button variant="destructive" onClick={handleReject}>
                            <X className="h-4 w-4 mr-2" />
                            Reject Request
                        </Button>
                        <Button onClick={handleApprove}>
                            <Check className="h-4 w-4 mr-2" />
                            Approve Request
                        </Button>
                    </>
                )}
                {request.status !== "pending" && (
                    <Button onClick={() => navigate("/approvals/categories")}>
                        Back to Requests
                    </Button>
                )}
            </div>
        </div>
    );
}