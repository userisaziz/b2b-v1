import express from "express";
import {
  getAllProductApprovalRequests,
  getProductApprovalRequestById,
  approveProductApprovalRequest,
  rejectProductApprovalRequest,
  getSellersPendingApproval,
  getSellerForApproval,
  approveSeller,
  rejectSeller,
  suspendSeller
} from "../controllers/approval.controller.js";
import { protectUniversal, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(protectUniversal);

// ======================================================
// PRODUCT APPROVAL ROUTES
// ======================================================

// Admin routes for managing product approval requests
router.get("/product-requests", requireRole("admin"), getAllProductApprovalRequests);
router.get("/product-requests/:id", requireRole("admin"), getProductApprovalRequestById);
router.patch("/product-requests/:id/approve", requireRole("admin"), approveProductApprovalRequest);
router.patch("/product-requests/:id/reject", requireRole("admin"), rejectProductApprovalRequest);

// ======================================================
// SELLER APPROVAL ROUTES
// ======================================================

// Admin routes for managing seller approvals
router.get("/sellers", requireRole("admin"), getSellersPendingApproval);
router.get("/sellers/:id", requireRole("admin"), getSellerForApproval);
router.patch("/sellers/:id/approve", requireRole("admin"), approveSeller);
router.patch("/sellers/:id/reject", requireRole("admin"), rejectSeller);
router.patch("/sellers/:id/suspend", requireRole("admin"), suspendSeller);

export default router;