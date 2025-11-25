import express from "express";
import { approveSeller, rejectSeller, getPendingSellers, createSeller, createBuyer } from "../controllers/admin.controller.js";
import { protectAdmin, requireRole } from "../middleware/auth.middleware.js";

const router = express.Router();

// Protect all admin routes - only admins can access
router.use(protectAdmin);

// Admin dashboard - only admins can access
router.get("/dashboard", requireRole('admin'), (req, res) => {
  res.json({ 
    success: true,
    message: "Admin Dashboard",
    user: req.user,
    userType: req.userType
  });
});

// Get pending sellers for approval - only admins can access
router.get("/pending-sellers", requireRole('admin'), getPendingSellers);

// Approve seller - only admins can access
router.post("/approve-seller", requireRole('admin'), approveSeller);

// Reject seller - only admins can access
router.post("/reject-seller", requireRole('admin'), rejectSeller);

// Create seller - only admins can access
router.post("/sellers", requireRole('admin'), createSeller);

// Create buyer - only admins can access
router.post("/buyers", requireRole('admin'), createBuyer);

export default router;