import ProductApprovalRequest from "../models/productApprovalRequest.model.js";
import Seller from "../models/seller.model.js";
import Category from "../models/category.model.js";
import Product from "../models/product.model.js";
import { Admin } from "../models/admin.model.js"; // Import Admin model

// ======================================================
// PRODUCT APPROVAL CONTROLLERS
// ======================================================

// Get all product approval requests (admin)
export const getAllProductApprovalRequests = async (req, res) => {
  try {
    const { status, sellerId, requestType } = req.query;
    let filter = {};
    
    if (status) filter.status = status;
    if (sellerId) filter.sellerId = sellerId;
    if (requestType) filter.requestType = requestType;
    
    const requests = await ProductApprovalRequest.find(filter)
      .populate("productId")
      .populate("sellerId", "name companyName email")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (err) {
    console.error("Get product approval requests error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get product approval request by ID
export const getProductApprovalRequestById = async (req, res) => {
  try {
    const request = await ProductApprovalRequest.findById(req.params.id)
      .populate("productId")
      .populate("sellerId", "name companyName email")
      .populate("reviewedBy", "name email");
    
    if (!request) {
      return res.status(404).json({ message: "Product approval request not found" });
    }
    
    res.json(request);
  } catch (err) {
    console.error("Get product approval request error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve a product approval request (admin)
export const approveProductApprovalRequest = async (req, res) => {
  try {
    const request = await ProductApprovalRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: "Product approval request not found" });
    }
    
    // Check if request is already approved or rejected
    if (request.status === "approved") {
      return res.status(400).json({ message: "Request is already approved" });
    }
    
    if (request.status === "rejected") {
      return res.status(400).json({ message: "Request is already rejected" });
    }
    
    // Update the product status to active
    const product = await Product.findById(request.productId);
    if (product) {
      product.status = "active";
      await product.save();
    }
    
    // Update the request
    request.status = "approved";
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();
    
    res.json({
      message: "Product approval request approved successfully",
      request,
      product
    });
  } catch (err) {
    console.error("Approve product approval request error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Reject a product approval request (admin)
export const rejectProductApprovalRequest = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const request = await ProductApprovalRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: "Product approval request not found" });
    }
    
    // Check if request is already approved or rejected
    if (request.status === "approved") {
      return res.status(400).json({ message: "Request is already approved" });
    }
    
    if (request.status === "rejected") {
      return res.status(400).json({ message: "Request is already rejected" });
    }
    
    request.status = "rejected";
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    request.rejectionReason = rejectionReason;
    await request.save();
    
    res.json({
      message: "Product approval request rejected successfully",
      request
    });
  } catch (err) {
    console.error("Reject product approval request error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ======================================================
// SELLER APPROVAL CONTROLLERS
// ======================================================

// Get all sellers pending approval (admin)
export const getSellersPendingApproval = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = { approvalStatus: "pending" };
    
    if (status && status !== "pending") {
      filter = { approvalStatus: status };
    }
    
    const sellers = await Seller.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });
    
    res.json(sellers);
  } catch (err) {
    console.error("Get sellers pending approval error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get seller for approval by ID (admin)
export const getSellerForApproval = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id)
      .select("-password")
      .populate("businessInfo.documents");
    
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }
    
    res.json(seller);
  } catch (err) {
    console.error("Get seller for approval error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve a seller (admin)
export const approveSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }
    
    if (seller.approvalStatus === "approved") {
      return res.status(400).json({ message: "Seller is already approved" });
    }
    
    seller.approvalStatus = "approved";
    seller.approvedBy = req.user._id;
    seller.approvedAt = new Date();
    await seller.save();
    
    res.json({
      message: "Seller approved successfully",
      seller
    });
  } catch (err) {
    console.error("Approve seller error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Reject a seller (admin)
export const rejectSeller = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const seller = await Seller.findById(req.params.id);
    
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }
    
    if (seller.approvalStatus === "approved") {
      return res.status(400).json({ message: "Seller is already approved" });
    }
    
    if (seller.approvalStatus === "rejected") {
      return res.status(400).json({ message: "Seller is already rejected" });
    }
    
    seller.approvalStatus = "rejected";
    seller.rejectedBy = req.user._id;
    seller.rejectedAt = new Date();
    seller.rejectionReason = rejectionReason;
    await seller.save();
    
    res.json({
      message: "Seller rejected successfully",
      seller
    });
  } catch (err) {
    console.error("Reject seller error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Suspend a seller (admin)
export const suspendSeller = async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id);
    
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }
    
    seller.approvalStatus = "suspended";
    seller.suspendedBy = req.user._id;
    seller.suspendedAt = new Date();
    await seller.save();
    
    res.json({
      message: "Seller suspended successfully",
      seller
    });
  } catch (err) {
    console.error("Suspend seller error:", err);
    res.status(500).json({ message: "Server error" });
  }
};