import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CategoryRequestForm from "@/components/seller/CategoryRequestForm";
import { 
  FolderTree, 
  Clock, 
  CheckCircle2, 
  XCircle 
} from "lucide-react";
import { StatsCard } from "@/components/common/StatsCard";
import { useState, useEffect } from "react";
import { getCategoryRequests } from "@/services/approval.service";
import type { CategoryAdditionRequest } from "@/services/approval.service";

// Extend the CategoryAdditionRequest interface to include flattenedPath
interface ExtendedCategoryAdditionRequest extends CategoryAdditionRequest {
  flattenedPath?: string;
}

export default function CategoryRequestPage() {
  const [additionRequests, setAdditionRequests] = useState<ExtendedCategoryAdditionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // ----------------------------------------------------
  // 🔥 Helper: Generate a flattened category path
  // ----------------------------------------------------
  const getFlattenedPath = (parentCategory?: any, proposedName?: string) => {
    const path: string[] = [];

    let current = parentCategory;
    while (current) {
      if (current.name) path.push(current.name);
      current = current.parent; // backend should populate parent
    }

    if (proposedName) path.push(proposedName);

    return path.length > 0 ? path.join(" → ") : proposedName || "";
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const additionData = await getCategoryRequests();

      // Attach flattened path to each request
      const flattened = additionData.map((req: any) => ({
        ...req,
        flattenedPath: getFlattenedPath(req.parentCategory, req.proposedName),
      }));

      setAdditionRequests(flattened);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Calculate stats
  const pendingRequests = additionRequests.filter(r => r.status === "pending").length;
  const approvedRequests = additionRequests.filter(r => r.status === "approved").length;
  const rejectedRequests = additionRequests.filter(r => r.status === "rejected" || r.status === "cancelled").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Category Requests</h1>
        <p className="text-muted-foreground mt-1">
          Request new categories at any level and track the status of your requests
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Pending Requests"
          value={pendingRequests}
          description="Awaiting review"
          icon={Clock}
          iconColor="amber"
        />
        <StatsCard
          title="Approved Requests"
          value={approvedRequests}
          description="Successfully added"
          icon={CheckCircle2}
          iconColor="emerald"
        />
        <StatsCard
          title="Rejected Requests"
          value={rejectedRequests}
          description="Needs revision"
          icon={XCircle}
          iconColor="red"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <CategoryRequestForm onSubmitted={() => fetchRequests()} />
        
        <Card>
          <CardHeader>
            <CardTitle>Your Recent Requests</CardTitle>
            <CardDescription>
              Track the status of your category requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : additionRequests.length === 0 ? (
              <div className="text-center py-8">
                <FolderTree className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No requests yet</h3>
                <p className="text-muted-foreground mt-1">
                  Submit your first category request using the form
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {additionRequests
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 5)
                  .map((request) => (
                    <div key={request._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        {/* 🔥 Flattened category path */}
                        <div className="font-medium">
                          {request.flattenedPath}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Submitted {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center">
                        {request.status === "pending" && (
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                            Pending
                          </span>
                        )}
                        {request.status === "approved" && (
                          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                            Approved
                          </span>
                        )}
                        {(request.status === "rejected" || request.status === "cancelled") && (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                            {request.status === "rejected" ? "Rejected" : "Cancelled"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}