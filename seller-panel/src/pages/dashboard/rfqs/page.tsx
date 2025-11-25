import { useState, useEffect } from "react";
import { Plus, Search, FileText, Clock, CheckCircle, XCircle, Send, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

import { getSellerRFQs } from "../../../services/rfq.service";
import type { RFQ } from "../../../services/rfq.service";
import { useNavigate } from "react-router-dom";

export default function RFQsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [filteredRFQs, setFilteredRFQs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  // Fetch RFQs from API
  useEffect(() => {
    const fetchRFQs = async () => {
      try {
        setLoading(true);
        const data = await getSellerRFQs();
        setRfqs(data);
        setFilteredRFQs(data);
      } catch (err: any) {
        console.error("Error fetching RFQs:", err);
        setError("Failed to load RFQs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRFQs();
  }, []);

  // Filter RFQs based on search query and status
  useEffect(() => {
    let filtered = rfqs;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(rfq =>
        rfq.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (rfq.description && rfq.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (rfq.productId && rfq.productId.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(rfq => rfq.status === statusFilter);
    }
    
    setFilteredRFQs(filtered);
  }, [searchQuery, statusFilter, rfqs]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "responded":
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Responded
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
            <XCircle className="mr-1 h-3 w-3" />
            Expired
          </span>
        );
      case "awarded":
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Awarded
          </span>
        );
      case "closed":
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
            <XCircle className="mr-1 h-3 w-3" />
            Closed
          </span>
        );
      case "open":
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            <Clock className="mr-1 h-3 w-3" />
            Open
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <div className="text-red-500 mb-2">{error}</div>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">RFQs</h1>
          <p className="text-muted-foreground mt-1">
            View and respond to Requests for Quotation
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          New RFQ
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search RFQs..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm max-w-[150px]"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="responded">Responded</option>
          <option value="awarded">Awarded</option>
          <option value="expired">Expired</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* RFQs Table */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="border-b bg-gray-50/50 px-6 py-4">
          <CardTitle>RFQ List</CardTitle>
          <CardDescription>
            View all RFQs sent to your products
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {rfqs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-1">No RFQs found</h3>
              <p className="text-gray-500 mb-4">
                You don't have any RFQs at the moment.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                  <TableHead className="pl-6">RFQ Title</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="text-left">Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRFQs.map((rfq) => (
                  <TableRow key={rfq._id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="pl-6 font-medium">{rfq.title}</TableCell>
                    <TableCell>{rfq.productId || 'N/A'}</TableCell>
                    <TableCell>{rfq.quantity} {rfq.unit}</TableCell>
                    <TableCell className="text-left">{getStatusBadge(rfq.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(rfq.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {rfq.expiryDate ? new Date(rfq.expiryDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/dashboard/rfqs/${rfq._id}`)}
                        className="shadow-sm"
                      >
                        <Send className="mr-1 h-3 w-3" />
                        {rfq.status === 'open' ? 'Respond' : 'View'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {filteredRFQs.length === 0 && rfqs.length > 0 && (
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
    </div>
  );
}