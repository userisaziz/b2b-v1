import { useState, useEffect } from "react";
import {
    Search,
    MoreVertical,
    Plus,
    Eye,
    TrendingUp,
    Users,
    ShoppingBag,
    CreditCard,
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
import { getSellers } from "@/services/seller.service";
import { getBuyers } from "@/services/buyer.service";
import AddUserModal from "@/components/user-management/AddUserModal";

interface User {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    status: string;
    approvalStatus?: string;
    createdAt: string;
    totalOrders?: number;
    spent?: string;
    totalProducts?: number;
    revenue?: string;
}

export default function UserManagementPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
    const [showAddUserModal, setShowAddUserModal] = useState(false);

    // Fetch users from API
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                // Fetch both sellers and buyers
                const [sellersData, buyersData] = await Promise.all([
                    getSellers(),
                    getBuyers()
                ]);

                // Add role property to each user
                const sellersWithRole = sellersData.map((seller: any) => ({ 
                    ...seller, 
                    role: 'seller',
                    status: seller.approvalStatus || 'pending'
                }));
                
                const buyersWithRole = buyersData.map((buyer: any) => ({ 
                    ...buyer, 
                    role: 'buyer',
                    approvalStatus: buyer.status,
                    totalProducts: undefined,
                    revenue: undefined
                }));

                setUsers([...sellersWithRole, ...buyersWithRole]);
            } catch (err) {
                console.error("Error fetching users:", err);
                setError("Failed to load users");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = users.filter(
        (user) => {
            const matchesSearch = 
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesRole = roleFilter === "all" || user.role === roleFilter;
            const userStatus = user.approvalStatus || user.status;
            const matchesStatus = statusFilter === "all" || userStatus === statusFilter;
            
            return matchesSearch && matchesRole && matchesStatus;
        }
    );

    // Calculate stats
    const sellers = users.filter(u => u.role === "seller");
    const buyers = users.filter(u => u.role === "buyer");
    
    const activeSellers = sellers.filter(s => (s.approvalStatus || s.status) === "approved").length;
    const pendingSellers = sellers.filter(s => (s.approvalStatus || s.status) === "pending").length;
    const activeBuyers = buyers.filter(b => (b.approvalStatus || b.status) === "active").length;
    
    const totalProducts = sellers.reduce((acc, curr) => acc + (curr.totalProducts || 0), 0);

    const getStatusBadge = (user: User) => {
        const status = user.approvalStatus || user.status;
        
        switch (status) {
            case "active":
            case "approved":
                return <Badge variant="default" className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-200">Active</Badge>;
            case "pending":
                return <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-amber-200">Pending</Badge>;
            case "inactive":
            case "rejected":
                return <Badge variant="destructive" className="bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-200">Inactive</Badge>;
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

    const handleViewDetails = (id: string, role: string) => {
        navigate(`/users/${role}s/${id}`);
    };

    const handleUserCreated = async () => {
        // Refresh the user list
        try {
            setLoading(true);
            // Fetch both sellers and buyers
            const [sellersData, buyersData] = await Promise.all([
                getSellers(),
                getBuyers()
            ]);

            // Add role property to each user
            const sellersWithRole = sellersData.map((seller: any) => ({ 
                ...seller, 
                role: 'seller',
                status: seller.approvalStatus || 'pending'
            }));
            
            const buyersWithRole = buyersData.map((buyer: any) => ({ 
                ...buyer, 
                role: 'buyer',
                approvalStatus: buyer.status,
                totalProducts: undefined,
                revenue: undefined
            }));

            setUsers([...sellersWithRole, ...buyersWithRole]);
        } catch (err) {
            console.error("Error refreshing users:", err);
            setError("Failed to refresh users");
        } finally {
            setLoading(false);
        }
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
                    <h3 className="text-lg font-medium text-gray-900">Error loading users</h3>
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
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">User Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage all users, buyers and sellers in the system
                    </p>
                </div>
                <Button className="bg-primary hover:bg-primary/90 shadow-sm" onClick={() => setShowAddUserModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New User
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Users"
                    value={users.length}
                    description={`${buyers.length} buyers, ${sellers.length} sellers`}
                    icon={Users}
                    iconColor="blue"
                />
                <StatsCard
                    title="Active Buyers"
                    value={activeBuyers}
                    description={`${Math.round((activeBuyers / buyers.length) * 100) || 0}% of buyers`}
                    icon={TrendingUp}
                    iconColor="emerald"
                />
                <StatsCard
                    title="Pending Sellers"
                    value={pendingSellers}
                    description="Requires approval"
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
                            <CardTitle>All Users</CardTitle>
                            <CardDescription>
                                Manage your user base and view their status
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search users..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 w-[250px] bg-white"
                                />
                            </div>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="border rounded-md px-3 py-2 text-sm"
                            >
                                <option value="all">All Roles</option>
                                <option value="buyer">Buyers</option>
                                <option value="seller">Sellers</option>
                            </select>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="border rounded-md px-3 py-2 text-sm"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="approved">Approved</option>
                                <option value="pending">Pending</option>
                                <option value="inactive">Inactive</option>
                                <option value="rejected">Rejected</option>
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
                                <TableHead className="w-[300px] pl-6">User Name</TableHead>
                                <TableHead>Contact Info</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Orders/Products</TableHead>
                                <TableHead>Revenue/Spent</TableHead>
                                <TableHead>Joined Date</TableHead>
                                <TableHead className="text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell className="pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                                                {getInitials(user.name)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{user.name}</div>
                                                <div className="text-xs text-muted-foreground">ID: {user._id.substring(0, 8)}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-700">{user.email}</span>
                                            <span className="text-xs text-muted-foreground">{user.phone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(user)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            {user.role === "buyer" ? (
                                                <>
                                                    <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span className="font-medium">{user.totalOrders || 0}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span className="font-medium">{user.totalProducts || 0}</span>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-gray-700">
                                        {user.role === "buyer" ? (user.spent || "SAR 0") : (user.revenue || "SAR 0")}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right pr-6">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger onClick={() => setDropdownOpen(dropdownOpen === user._id ? null : user._id)}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent open={dropdownOpen === user._id} align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleViewDetails(user._id, user.role)}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </DropdownMenuItem>
                                                {user.role === "seller" && (user.approvalStatus === "pending" || user.status === "pending") && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem>
                                                            <span className="text-emerald-600">Approve Seller</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <span className="text-red-600">Reject Seller</span>
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600">
                                                    Deactivate Account
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12">
                            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <Search className="h-6 w-6 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No users found</h3>
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