import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Eye,
  Filter,
  MoreVertical,
  Calendar,
  User,
  Package,
  Tag,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send
} from "lucide-react";
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
import { getAllRFQs, distributeRFQ } from "@/services/rfq.service";
import { getSellers } from "@/services/seller.service";

interface RFQ {
  _id: string;
  title: string;
  description: string;
  productId?: string;
  categoryId?: string;
  quantity: number;
  unit: string;
  buyerId?: string;
  adminId?: string;
  status: string;
  distributionType: string;
  targetSellerIds: string[];
  responses: any[];
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
  product?: {
    name: string;
    sku: string;
  };
  category?: {
    name: string;
  };
  buyer?: {
    name: string;
    email: string;
  };
}

interface Seller {
  _id: string;
  name: string;
  email: string;
  companyName: string;
  approvalStatus: string;
}

export default function RFQListPage() {
  const navigate = useNavigate();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [showDistributeModal, setShowDistributeModal] = useState(false);
  const [selectedRFQ, setSelectedRFQ] = useState<RFQ | null>(null);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSellers, setSelectedSellers] = useState<string[]>([]);
  const [distributing, setDistributing] = useState(false);

  // Fetch RFQs from API
  useEffect(() => {
    const fetchRFQs = async () => {
      try {
        setLoading(true);
        const data = await getAllRFQs();
        setRfqs(data);
      } catch (err) {
        console.error("Error fetching RFQs:", err);
        setError("Failed to load RFQs");
      } finally {
        setLoading(false);
      }
    };

    fetchRFQs();
  }, []);

  // Fetch sellers for distribution
  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const data = await getSellers();
        setSellers(data);
      } catch (err) {
        console.error("Error fetching sellers:", err);
      }
    };

    fetchSellers();
  }, []);

  const filteredRFQs = rfqs.filter(
    (rfq) => {
      const matchesSearch = 
        rfq.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rfq.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (rfq.product && rfq.product.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (rfq.category && rfq.category.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === "all" || rfq.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    }
  );

  // Calculate stats
  const totalRFQs = rfqs.length;
  const publishedRFQs = rfqs.filter(r => r.status === "published").length;
  const draftRFQs = rfqs.filter(r => r.status === "draft").length;
  const totalResponses = rfqs.reduce((acc, rfq) => acc + rfq.responses.length, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge variant="default" className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-200">Published</Badge>;
      case "draft":
        return <Badge variant="secondary" className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-amber-200">Draft</Badge>;
      case "closed":
        return <Badge variant="destructive" className="bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-200">Closed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-gray-500/15 text-gray-700 hover:bg-gray-500/25 border-gray-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDistributionBadge = (type: string) => {
    switch (type) {
      case "all":
        return <Badge variant="default" className="bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 border-blue-200">All Sellers</Badge>;
      case "category":
        return <Badge variant="secondary" className="bg-purple-500/15 text-purple-700 hover:bg-purple-500/25 border-purple-200">Category</Badge>;
      case "specific":
        return <Badge variant="outline" className="bg-indigo-500/15 text-indigo-700 hover:bg-indigo-500/25 border-indigo-200">Specific</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const handleViewDetails = (id: string) => {
    navigate(`/rfqs/${id}`);
  };

  const handleCreateRFQ = () => {
    navigate("/rfqs/new");
  };

  const handleDistributeClick = (rfq: RFQ) => {
    setSelectedRFQ(rfq);
    // Pre-select sellers that are already targeted
    setSelectedSellers(rfq.targetSellerIds || []);
    setShowDistributeModal(true);
    setDropdownOpen(null);
  };

  const toggleSellerSelection = (sellerId: string) => {
    setSelectedSellers(prev => 
      prev.includes(sellerId) 
        ? prev.filter(id => id !== sellerId)
        : [...prev, sellerId]
    );
  };

  const handleDistribute = async () => {
    if (!selectedRFQ || selectedSellers.length === 0) return;
    
    try {
      setDistributing(true);
      await distributeRFQ(selectedRFQ._id, selectedSellers);
      
      // Update the RFQ in the list
      setRfqs(prev => prev.map(rfq => 
        rfq._id === selectedRFQ._id 
          ? { ...rfq, targetSellerIds: [...new Set([...rfq.targetSellerIds, ...selectedSellers])] } 
          : rfq
      ));
      
      setShowDistributeModal(false);
      setSelectedRFQ(null);
      setSelectedSellers([]);
    } catch (err) {
      console.error("Error distributing RFQ:", err);
      alert("Failed to distribute RFQ");
    } finally {
      setDistributing(false);
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
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Error loading RFQs</h3>
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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">RFQ Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage Request for Quotation and track seller responses
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 shadow-sm" onClick={handleCreateRFQ}>
          <Plus className="h-4 w-4 mr-2" />
          Create New RFQ
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total RFQs"
          value={totalRFQs}
          description="+5 from last month"
          icon={Package}
          iconColor="blue"
        />
        <StatsCard
          title="Published RFQs"
          value={publishedRFQs}
          description="Active for responses"
          icon={CheckCircle}
          iconColor="emerald"
        />
        <StatsCard
          title="Draft RFQs"
          value={draftRFQs}
          description="Not yet published"
          icon={Clock}
          iconColor="amber"
        />
        <StatsCard
          title="Total Responses"
          value={totalResponses}
          description="From sellers"
          icon={User}
          iconColor="purple"
        />
      </div>

      {/* Main Content */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="border-b bg-gray-50/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All RFQs</CardTitle>
              <CardDescription>
                Manage your RFQs and track seller responses
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search RFQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-[250px] bg-white"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
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
                <TableHead className="w-[300px] pl-6">RFQ Title</TableHead>
                <TableHead>Product/Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Distribution</TableHead>
                <TableHead>Responses</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRFQs.map((rfq) => (
                <TableRow key={rfq._id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell className="pl-6">
                    <div className="flex flex-col">
                      <div className="font-medium text-gray-900">{rfq.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{rfq.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      {rfq.product ? (
                        <>
                          <span className="font-medium">{rfq.product.name}</span>
                          <span className="text-xs text-muted-foreground">SKU: {rfq.product.sku}</span>
                        </>
                      ) : rfq.category ? (
                        <span className="font-medium">{rfq.category.name}</span>
                      ) : (
                        <span className="text-muted-foreground">General RFQ</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">{rfq.quantity}</span>
                      <span className="text-xs text-muted-foreground">{rfq.unit}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(rfq.status)}</TableCell>
                  <TableCell>{getDistributionBadge(rfq.distributionType)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">{rfq.responses.length}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(rfq.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger onClick={() => setDropdownOpen(dropdownOpen === rfq._id ? null : rfq._id)}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent open={dropdownOpen === rfq._id} align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewDetails(rfq._id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDistributeClick(rfq)}>
                          <Send className="h-4 w-4 mr-2" />
                          Distribute to Sellers
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          Close RFQ
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredRFQs.length === 0 && (
            <div className="text-center py-12">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No RFQs found</h3>
              <p className="text-muted-foreground mt-1">
                Try adjusting your search terms or filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Distribute to Sellers Modal */}
      {showDistributeModal && selectedRFQ && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-semibold">Distribute RFQ to Sellers</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Select sellers to distribute "{selectedRFQ.title}" to
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                  {sellers.map((seller) => (
                    <div 
                      key={seller._id} 
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedSellers.includes(seller._id) 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => toggleSellerSelection(seller._id)}
                    >
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          checked={selectedSellers.includes(seller._id)}
                          onChange={() => {}}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{seller.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{seller.companyName}</p>
                      </div>
                      <Badge 
                        variant={seller.approvalStatus === "approved" ? "default" : "secondary"}
                        className={
                          seller.approvalStatus === "approved" 
                            ? "bg-emerald-500/15 text-emerald-700 text-xs" 
                            : "bg-amber-500/15 text-amber-700 text-xs"
                        }
                      >
                        {seller.approvalStatus}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDistributeModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleDistribute} 
                disabled={selectedSellers.length === 0 || distributing}
              >
                {distributing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Distributing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Distribute ({selectedSellers.length} selected)
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}