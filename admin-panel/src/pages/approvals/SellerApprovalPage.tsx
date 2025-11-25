import { useState, useEffect } from "react";
import {
    Search,
    MoreVertical,
    Check,
    X,
    Eye,
    UserPlus,
    Clock,
    Building2,
    ShieldCheck,
    Filter,
    AlertTriangle
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
    getSellerApprovals, 
    approveSeller, 
    rejectSeller,
    suspendSeller
} from "@/services/approval.service";
import type { SellerApproval } from "@/services/approval.service";

export default function SellerApprovalPage() {
    const navigate = useNavigate();
    const [sellers, setSellers] = useState<SellerApproval[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("pending");
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

    // Fetch sellers pending approval
    useEffect(() => {
        const fetchSellers = async () => {
            try {
                setLoading(true);
                const params: any = {};
                if (statusFilter !== "all") params.status = statusFilter;
                const data = await getSellerApprovals(params);
                setSellers(data);
            } catch (err) {
                console.error("Error fetching sellers:", err);
                setError("Failed to load sellers");
            } finally {
                setLoading(false);
            }
        };

        fetchSellers();
    }, [statusFilter]);

    const filteredSellers = sellers.filter(
        (seller) =>
            seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            seller.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (seller.crNumber && seller.crNumber.includes(searchQuery))
    );

    // Calculate stats
    const newRegistrations = sellers.filter(s => 
        new Date(s.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    ).length;
    const pendingVerification = sellers.filter(s => s.approvalStatus === "pending").length;
    const approvedThisMonth = sellers.filter(s => 
        s.approvalStatus === "approved" && 
        new Date(s.approvedAt || "").getMonth() === new Date().getMonth()
    ).length;
    const totalSellers = sellers.length;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "approved":
                return <Badge variant="default" className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-200">Approved</Badge>;
            case "pending":
                return <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-amber-200">Pending</Badge>;
            case "rejected":
                return <Badge variant="destructive" className="bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-200">Rejected</Badge>;
            case "suspended":
                return <Badge variant="destructive" className="bg-gray-500/15 text-gray-700 hover:bg-gray-500/25 border-gray-200">Suspended</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
    };

    const handleApprove = async (id: string) => {
        try {
            await approveSeller(id);
            // Refresh the sellers
            const params: any = {};
            if (statusFilter !== "all") params.status = statusFilter;
            const data = await getSellerApprovals(params);
            setSellers(data);
            setDropdownOpen(null);
        } catch (err) {
            console.error("Error approving seller:", err);
            alert("Failed to approve seller");
        }
    };

    const handleReject = async (id: string) => {
        const rejectionReason = prompt("Enter rejection reason:");
        if (!rejectionReason) return;
        
        try {
            await rejectSeller(id, rejectionReason);
            // Refresh the sellers
            const params: any = {};
            if (statusFilter !== "all") params.status = statusFilter;
            const data = await getSellerApprovals(params);
            setSellers(data);
            setDropdownOpen(null);
        } catch (err) {
            console.error("Error rejecting seller:", err);
            alert("Failed to reject seller");
        }
    };

    const handleSuspend = async (id: string) => {
        if (!window.confirm("Are you sure you want to suspend this seller?")) return;
        
        try {
            await suspendSeller(id);
            // Refresh the sellers
            const params: any = {};
            if (statusFilter !== "all") params.status = statusFilter;
            const data = await getSellerApprovals(params);
            setSellers(data);
            setDropdownOpen(null);
        } catch (err) {
            console.error("Error suspending seller:", err);
            alert("Failed to suspend seller");
        }
    };

    const handleViewDetails = (id: string) => {
        navigate(`/approvals/sellers/${id}`);
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
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Error loading sellers</h3>
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
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Seller Approval</h1>
                    <p className="text-muted-foreground mt-1">
                        Review and approve seller registration requests
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="New Registrations"
                    value={newRegistrations}
                    description="This week"
                    icon={UserPlus}
                    iconColor="blue"
                />
                <StatsCard
                    title="Pending Verification"
                    value={pendingVerification}
                    description="Documents submitted"
                    icon={Clock}
                    iconColor="amber"
                />
                <StatsCard
                    title="Approved This Month"
                    value={approvedThisMonth}
                    description="+12% vs last month"
                    icon={ShieldCheck}
                    iconColor="emerald"
                />
                <StatsCard
                    title="Total Sellers"
                    value={totalSellers}
                    description="Active platform sellers"
                    icon={Building2}
                    iconColor="purple"
                />
            </div>

            {/* Approval Requests Table */}
            <Card className="shadow-sm border-gray-200">
                <CardHeader className="border-b bg-gray-50/50 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Pending Seller Approvals</CardTitle>
                            <CardDescription>
                                Review seller registration requests and approve or reject them
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search requests..."
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
                                <option value="suspended">Suspended</option>
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
                                <TableHead className="pl-6">Company Name</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>CR Number</TableHead>
                                <TableHead>Business Type</TableHead>
                                <TableHead>Request Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSellers.map((seller) => (
                                <TableRow key={seller._id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell className="pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                                                {getInitials(seller.name)}
                                            </div>
                                            <div className="font-medium text-gray-900">{seller.companyName}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-700">{seller.email}</span>
                                            <span className="text-xs text-muted-foreground">{seller.phone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">{seller.crNumber || "N/A"}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{seller.businessType}</Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(seller.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(seller.approvalStatus)}</TableCell>
                                    <TableCell className="text-right pr-6">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger onClick={() => setDropdownOpen(dropdownOpen === seller._id ? null : seller._id)}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent open={dropdownOpen === seller._id} align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleViewDetails(seller._id)}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </DropdownMenuItem>
                                                {seller.approvalStatus === "pending" && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleApprove(seller._id)} className="text-emerald-600">
                                                            <Check className="h-4 w-4 mr-2" />
                                                            Approve Application
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleReject(seller._id)} className="text-red-600">
                                                            <X className="h-4 w-4 mr-2" />
                                                            Reject Application
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                {seller.approvalStatus === "approved" && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleSuspend(seller._id)} className="text-red-600">
                                                            <X className="h-4 w-4 mr-2" />
                                                            Suspend Account
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

                    {filteredSellers.length === 0 && (
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