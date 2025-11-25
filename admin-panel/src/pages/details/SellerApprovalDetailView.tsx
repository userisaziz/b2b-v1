import { useState } from "react";
import { ArrowLeft, Phone, Mail, MapPin, Calendar, Check, X, FileText } from "lucide-react";
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

export default function SellerApprovalDetailView() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [adminNotes, setAdminNotes] = useState("");
    
    // Mock data for seller approval request
    const approvalRequest = {
        id: 1,
        sellerName: "Tech Solutions Inc",
        email: "contact@techsolutions.com",
        phone: "+966 50 123 4567",
        address: "123 Business District, Riyadh, Saudi Arabia",
        registrationNumber: "1010234567",
        vatNumber: "VAT1010234567",
        companyDocuments: [
            {
                name: "Commercial Registration.pdf",
                url: "#",
            },
            {
                name: "VAT Certificate.pdf",
                url: "#",
            },
            {
                name: "Bank Account Details.pdf",
                url: "#",
            },
        ],
        requestDate: "2024-01-15",
        status: "pending",
        sellerNotes: "We are a new technology company looking to expand our market reach through your platform.",
    };

    const handleApprove = () => {
        // In a real app, this would make an API call
        console.log("Approved seller request");
        navigate("/approvals/sellers");
    };

    const handleReject = () => {
        // In a real app, this would make an API call
        console.log("Rejected seller request");
        navigate("/approvals/sellers");
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Seller Approval Request</h1>
                    <p className="text-muted-foreground">
                        Review and decide on seller registration request
                    </p>
                </div>
            </div>

            {/* Request Info */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>{approvalRequest.sellerName}</CardTitle>
                            <CardDescription>
                                Registration requested on {approvalRequest.requestDate}
                            </CardDescription>
                        </div>
                        <Badge variant="warning">Pending Review</Badge>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Company Name</h3>
                            <p className="font-medium">{approvalRequest.sellerName}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Email</h3>
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <p>{approvalRequest.email}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Phone</h3>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <p>{approvalRequest.phone}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Address</h3>
                            <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <p>{approvalRequest.address}</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Registration Number</h3>
                            <p className="font-mono">{approvalRequest.registrationNumber}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">VAT Number</h3>
                            <p className="font-mono">{approvalRequest.vatNumber}</p>
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-muted-foreground">Seller Notes</h3>
                            <p>{approvalRequest.sellerNotes}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Documents */}
            <Card>
                <CardHeader>
                    <CardTitle>Submitted Documents</CardTitle>
                    <CardDescription>
                        Documents provided by the seller for verification
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {approvalRequest.companyDocuments.map((document, index) => (
                            <div key={index} className="border rounded-lg p-4 flex items-center gap-3">
                                <FileText className="h-8 w-8 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">{document.name}</p>
                                    <Button variant="link" className="p-0 h-auto" onClick={() => window.open(document.url, '_blank')}>
                                        View Document
                                    </Button>
                                </div>
                            </div>
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
                <Button variant="outline" onClick={() => navigate("/approvals/sellers")}>
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