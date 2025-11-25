import { useState, useEffect } from "react";
import {
    Search,
    MoreVertical,
    Check,
    X,
    Eye,
    FolderTree,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Filter,
    AlertTriangleIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatsCard } from "@/components/common/StatsCard";
import { 
    getCategoryRequests, 
    approveCategoryRequest, 
    rejectCategoryRequest 
} from "@/services/approval.service";
import type { CategoryRequest } from "@/services/approval.service";

export default function CategoryApprovalPage() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState<CategoryRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

    // Fetch category requests
    useEffect(() => {
        const fetchRequests = async () => {
            try {
                setLoading(true);
                const params: any = {};
                if (statusFilter !== "all") params.status = statusFilter;
                const data = await getCategoryRequests(params);
                setRequests(data);
            } catch (err) {
                console.error("Error fetching category requests:", err);
                setError("Failed to load category requests");
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [statusFilter]);

    const filteredRequests = requests.filter(
        (request) =>
            request.proposedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.sellerId.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate stats
    const totalRequests = requests.length;
    const pendingReview = requests.filter(r => r.status === "pending").length;
    const approvedToday = requests.filter(r => 
        r.status === "approved" && 
        new Date(r.reviewedAt || "").toDateString() === new Date().toDateString()
    ).length;
    const rejectedRequests = requests.filter(r => r.status === "rejected").length;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "approved":
                return <Badge variant="default" className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-200">Approved</Badge>;
            case "pending":
                return <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-amber-200">Pending</Badge>;
            case "rejected":
                return <Badge variant="destructive" className="bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-200">Rejected</Badge>;
            case "cancelled":
                return <Badge variant="outline" className="bg-gray-500/15 text-gray-700 hover:bg-gray-500/25 border-gray-200">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await approveCategoryRequest(id);
            // Refresh the requests
            const params: any = {};
            if (statusFilter !== "all") params.status = statusFilter;
            const data = await getCategoryRequests(params);
            setRequests(data);
            setDropdownOpen(null);
        } catch (err) {
            console.error("Error approving category request:", err);
            alert("Failed to approve category request");
        }
    };

    const handleReject = async (id: string) => {
        const rejectionReason = prompt("Enter rejection reason:");
        if (!rejectionReason) return;
        
        try {
            await rejectCategoryRequest(id, rejectionReason);
            // Refresh the requests
            const params: any = {};
            if (statusFilter !== "all") params.status = statusFilter;
            const data = await getCategoryRequests(params);
            setRequests(data);
            setDropdownOpen(null);
        } catch (err) {
            console.error("Error rejecting category request:", err);
            alert("Failed to reject category request");
        }
    };

    const handleViewDetails = (id: string) => {
        navigate(`/approvals/categories/${id}`);
        setDropdownOpen(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <AlertTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Error loading requests</h3>
                    <p className="text-muted-foreground mt-1">{error}</p>
                    <Button className="mt-4" onClick={() => window.location.reload()}>
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Category Approval</h1>
                    <p className="text-muted-foreground mt-1">
                        Review and approve category requests from sellers
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Requests"
                    value={totalRequests}
                    description="This week"
                    icon={FolderTree}
                    iconColor="blue"
                />
                <StatsCard
                    title="Pending Review"
                    value={pendingReview}
                    description="Requires attention"
                    icon={Clock}
                    iconColor="amber"
                />
                <StatsCard
                    title="Approved Today"
                    value={approvedToday}
                    description="Categories added"
                    icon={CheckCircle2}
                    iconColor="emerald"
                />
                <StatsCard
                    title="Rejected Requests"
                    value={rejectedRequests}
                    description="Declined requests"
                    icon={AlertTriangle}
                    iconColor="red"
                />
            </div>

            {/* Approval Requests Table */}
            <Card className="shadow-sm border-gray-200">
                <CardHeader className="border-b bg-gray-50/50 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Pending Category Requests</CardTitle>
                            <CardDescription>
                                Review category requests and approve or reject them
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search categories..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 w-[300px] bg-white"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border rounded-md px-3 py-2 text-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <Button variant="outline" size="icon">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                                <TableHead className="pl-6">Category Name</TableHead>
                                <TableHead>Seller</TableHead>
                                <TableHead>Parent Category</TableHead>
                                <TableHead>Request Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRequests.map((request) => (
                                <TableRow key={request._id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell className="pl-6 font-medium">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-400">
                                                <FolderTree className="h-5 w-5" />
                                            </div>
                                            <span>{request.proposedName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{request.sellerId.name}</TableCell>
                                    <TableCell>
                                        {request.parentCategoryName || "Root Category"}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(request.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                                    <TableCell className="text-right pr-6">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger onClick={() => setDropdownOpen(dropdownOpen === request._id ? null : request._id)}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent open={dropdownOpen === request._id} align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleViewDetails(request._id)}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </DropdownMenuItem>
                                                {request.status === "pending" && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleApprove(request._id)} className="text-emerald-600">
                                                            <Check className="h-4 w-4 mr-2" />
                                                            Approve Category
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleReject(request._id)} className="text-red-600">
                                                            <X className="h-4 w-4 mr-2" />
                                                            Reject Category
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {filteredRequests.length === 0 && (
                        <div className="text-center py-12">
                            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <Search className="h-6 w-6 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No requests found</h3>
                            <p className="text-muted-foreground mt-1">
                                Try adjusting your search terms
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}