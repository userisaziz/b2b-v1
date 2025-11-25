import { useState, useEffect } from "react";
import {
    Search,
    MoreVertical,
    Plus,
    Eye,
    TrendingUp,
    Users,
    ShoppingBag,
    AlertCircle,
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
import { getSellers, approveSeller, rejectSeller } from "@/services/seller.service";
import AddUserModal from "@/components/user-management/AddUserModal";

interface Seller {
    _id: string;
    name: string;
    email: string;
    phone: string;
    companyName: string;
    businessType: string;
    approvalStatus: string;
    isVerified: boolean;
    createdAt: string;
    totalProducts?: number;
    revenue?: string;
}

export default function SellerManagementPage() {
    const navigate = useNavigate();
    const [sellers, setSellers] = useState<Seller[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
    const [showAddUserModal, setShowAddUserModal] = useState(false);

    // Fetch sellers from API
    useEffect(() => {
        const fetchSellers = async () => {
            try {
                setLoading(true);
                const data = await getSellers();
                setSellers(data);
            } catch (err) {
                console.error("Error fetching sellers:", err);
                setError("Failed to load sellers");
            } finally {
                setLoading(false);
            }
        };

        fetchSellers();
    }, []);

    const filteredSellers = sellers.filter(
        (seller) =>
            seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            seller.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            seller.companyName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate stats
    const totalSellers = sellers.length;
    const activeSellers = sellers.filter(s => s.approvalStatus === "approved").length;
    const pendingSellers = sellers.filter(s => s.approvalStatus === "pending").length;
    const totalProducts = sellers.reduce((acc, curr) => acc + (curr.totalProducts || 0), 0);

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

    const handleViewDetails = (id: string) => {
        navigate(`/users/sellers/${id}`);
    };

    const handleApproveSeller = async (id: string) => {
        try {
            await approveSeller(id);
            // Refresh the sellers list
            const data = await getSellers();
            setSellers(data);
            setDropdownOpen(null);
        } catch (error) {
            console.error("Error approving seller:", error);
            alert("Failed to approve seller");
        }
    };

    const handleRejectSeller = async (id: string) => {
        const rejectionReason = prompt("Enter rejection reason:");
        if (!rejectionReason) return;
        
        try {
            await rejectSeller(id, rejectionReason);
            // Refresh the sellers list
            const data = await getSellers();
            setSellers(data);
            setDropdownOpen(null);
        } catch (error) {
            console.error("Error rejecting seller:", error);
            alert("Failed to reject seller");
        }
    };

    const handleUserCreated = async () => {
        // Refresh the sellers list
        try {
            const data = await getSellers();
            setSellers(data);
        } catch (err) {
            console.error("Error refreshing sellers:", err);
            setError("Failed to refresh sellers");
        }
        setShowAddUserModal(false);
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
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Seller Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Monitor seller performance, approve accounts, and manage listings
                    </p>
                </div>
                <Button className="bg-primary hover:bg-primary/90 shadow-sm" onClick={() => setShowAddUserModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Seller
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Sellers"
                    value={totalSellers}
                    description="+2 from last month"
                    icon={Users}
                    iconColor="blue"
                />
                <StatsCard
                    title="Active Sellers"
                    value={activeSellers}
                    description={`${Math.round((activeSellers / totalSellers) * 100)}% of total`}
                    icon={TrendingUp}
                    iconColor="emerald"
                />
                <StatsCard
                    title="Pending Approval"
                    value={pendingSellers}
                    description="Requires attention"
                    icon={AlertCircle}
                    iconColor="amber"
                />
                <StatsCard
                    title="Total Products"
                    value={totalProducts}
                    description="Across all sellers"
                    icon={ShoppingBag}
                    iconColor="purple"
                />
            </div>

            {/* Main Content */}
            <Card className="shadow-sm border-gray-200">
                <CardHeader className="border-b bg-gray-50/50 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Registered Sellers</CardTitle>
                            <CardDescription>
                                Manage your seller base and view their status
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search sellers..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 w-[250px] bg-white"
                                />
                            </div>
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
                                <TableHead className="w-[300px] pl-6">Seller Name</TableHead>
                                <TableHead>Contact Info</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Products</TableHead>
                                <TableHead>Revenue</TableHead>
                                <TableHead>Joined Date</TableHead>
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
                                            <div>
                                                <div className="font-medium text-gray-900">{seller.name}</div>
                                                <div className="text-xs text-muted-foreground">ID: {seller._id.substring(0, 8)}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-700">{seller.email}</span>
                                            <span className="text-xs text-muted-foreground">{seller.phone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(seller.approvalStatus)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="font-medium">{seller.totalProducts || 0}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-gray-700">{seller.revenue || "SAR 0"}</TableCell>
                                    <TableCell className="text-muted-foreground">{new Date(seller.createdAt).toLocaleDateString()}</TableCell>
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
                                                        <DropdownMenuItem onClick={() => handleApproveSeller(seller._id)}>
                                                            <span className="text-emerald-600">Approve Seller</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleRejectSeller(seller._id)}>
                                                            <span className="text-red-600">Reject Seller</span>
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                {seller.approvalStatus === "approved" && (
                                                    <DropdownMenuItem className="text-red-600">
                                                        Deactivate Account
                                                    </DropdownMenuItem>
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
                            <h3 className="text-lg font-medium text-gray-900">No sellers found</h3>
                            <p className="text-muted-foreground mt-1">
                                Try adjusting your search terms or filters
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AddUserModal 
                open={showAddUserModal} 
                onClose={() => setShowAddUserModal(false)} 
                onUserCreated={handleUserCreated} 
            />
        </div>
    );
}