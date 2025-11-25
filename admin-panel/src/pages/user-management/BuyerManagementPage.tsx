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
import { getBuyers } from "@/services/buyer.service";
import AddUserModal from "@/components/user-management/AddUserModal";

interface Buyer {
    _id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    createdAt: string;
    totalOrders?: number;
    spent?: string;
}

export default function BuyerManagementPage() {
    const navigate = useNavigate();
    const [buyers, setBuyers] = useState<Buyer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
    const [showAddUserModal, setShowAddUserModal] = useState(false);

    // Fetch buyers from API
    useEffect(() => {
        const fetchBuyers = async () => {
            try {
                setLoading(true);
                const data = await getBuyers();
                setBuyers(data);
            } catch (err) {
                console.error("Error fetching buyers:", err);
                setError("Failed to load buyers");
            } finally {
                setLoading(false);
            }
        };

        fetchBuyers();
    }, []);

    const filteredBuyers = buyers.filter(
        (buyer) =>
            buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            buyer.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate stats
    const totalBuyers = buyers.length;
    const activeBuyers = buyers.filter(b => b.status === "active").length;
    const totalOrders = buyers.reduce((acc, curr) => acc + (curr.totalOrders || 0), 0);
    // Mock calculation for total spent
    const totalSpent = "SAR " + (buyers.reduce((acc, curr) => acc + parseFloat(curr.spent?.replace("SAR ", "") || "0"), 0)).toFixed(2);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return <Badge variant="default" className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-200">Active</Badge>;
            case "inactive":
                return <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-amber-200">Inactive</Badge>;
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
        navigate(`/users/buyers/${id}`);
    };

    const handleUserCreated = async () => {
        // Refresh the buyers list
        try {
            const data = await getBuyers();
            setBuyers(data);
        } catch (err) {
            console.error("Error refreshing buyers:", err);
            setError("Failed to refresh buyers");
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
                    <h3 className="text-lg font-medium text-gray-900">Error loading buyers</h3>
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
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Buyer Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Monitor buyer activity, order history, and account status
                    </p>
                </div>
                <Button className="bg-primary hover:bg-primary/90 shadow-sm" onClick={() => setShowAddUserModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Buyer
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Buyers"
                    value={totalBuyers}
                    description="+5 from last month"
                    icon={Users}
                    iconColor="blue"
                />
                <StatsCard
                    title="Active Buyers"
                    value={activeBuyers}
                    description={`${Math.round((activeBuyers / totalBuyers) * 100)}% of total`}
                    icon={TrendingUp}
                    iconColor="emerald"
                />
                <StatsCard
                    title="Total Orders"
                    value={totalOrders}
                    description="Lifetime orders"
                    icon={ShoppingBag}
                    iconColor="orange"
                />
                <StatsCard
                    title="Total Spent"
                    value={totalSpent}
                    description="Lifetime value"
                    icon={CreditCard}
                    iconColor="purple"
                />
            </div>

            {/* Main Content */}
            <Card className="shadow-sm border-gray-200">
                <CardHeader className="border-b bg-gray-50/50 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Registered Buyers</CardTitle>
                            <CardDescription>
                                Manage your buyer base and view their status
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search buyers..."
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
                                <TableHead className="w-[300px] pl-6">Buyer Name</TableHead>
                                <TableHead>Contact Info</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Orders</TableHead>
                                <TableHead>Total Spent</TableHead>
                                <TableHead>Joined Date</TableHead>
                                <TableHead className="text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBuyers.map((buyer) => (
                                <TableRow key={buyer._id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell className="pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                                                {getInitials(buyer.name)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{buyer.name}</div>
                                                <div className="text-xs text-muted-foreground">ID: {buyer._id.substring(0, 8)}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-gray-700">{buyer.email}</span>
                                            <span className="text-xs text-muted-foreground">{buyer.phone}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(buyer.status)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="font-medium">{buyer.totalOrders || 0}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-gray-700">{buyer.spent || "SAR 0"}</TableCell>
                                    <TableCell className="text-muted-foreground">{new Date(buyer.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right pr-6">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger onClick={() => setDropdownOpen(dropdownOpen === buyer._id ? null : buyer._id)}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent open={dropdownOpen === buyer._id} align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleViewDetails(buyer._id)}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </DropdownMenuItem>
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

                    {filteredBuyers.length === 0 && (
                        <div className="text-center py-12">
                            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <Search className="h-6 w-6 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No buyers found</h3>
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